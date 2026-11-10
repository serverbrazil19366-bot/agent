"""Builds ../workflow.json from the node sources in this folder.
Run: python3 build.py"""
import json, pathlib, uuid

HERE = pathlib.Path(__file__).parent
read = lambda f: (HERE / f).read_text()

LOG_COLUMNS = ["date", "status", "business_name", "website", "domain", "phone",
               "address", "rating", "place_id", "speed_index", "perf_score",
               "contact_name", "email", "email_position", "note"]

def log_node(name, pos):
    value = {c: "={{ $json.%s ?? '' }}" % c for c in LOG_COLUMNS}
    value["date"] = "={{ $now.setZone('Asia/Kolkata').toFormat('yyyy-MM-dd HH:mm') }}"
    if name == "Log No Website":
        value["status"] = "no_website"
    return {
        "name": name, "type": "n8n-nodes-base.googleSheets", "typeVersion": 4.5,
        "position": pos,
        "parameters": {
            "operation": "append",
            "documentId": {"__rl": True, "mode": "id", "value": "={{ $('Config').first().json.sheet_id }}"},
            "sheetName": {"__rl": True, "mode": "name", "value": "Leads Log"},
            "columns": {
                "mappingMode": "defineBelow", "value": value, "matchingColumns": [],
                "schema": [{"id": c, "displayName": c, "required": False, "defaultMatch": False,
                            "display": True, "type": "string", "canBeUsedToMatch": True} for c in LOG_COLUMNS],
            },
            "options": {},
        },
    }

def code(name, file, pos, each=False):
    p = {"jsCode": read(file)}
    if each:
        p["mode"] = "runOnceForEachItem"
    return {"name": name, "type": "n8n-nodes-base.code", "typeVersion": 2, "position": pos, "parameters": p}

def cond(left, op_type, op, right=None, single=False):
    c = {"id": str(uuid.uuid4()), "leftValue": left, "operator": {"type": op_type, "operation": op}}
    if single:
        c["operator"]["singleValue"] = True
        c["rightValue"] = ""
    else:
        c["rightValue"] = right
    return {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose"},
                           "conditions": [c], "combinator": "and"}, "options": {}}

def if_node(name, pos, params):
    return {"name": name, "type": "n8n-nodes-base.if", "typeVersion": 2, "position": pos, "parameters": params}

def http(name, pos, params, cred_type, timeout, on_error=None):
    params.setdefault("options", {})["timeout"] = timeout
    n = {"name": name, "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": pos,
         "parameters": {"authentication": "genericCredentialType", "genericAuthType": cred_type, **params}}
    if on_error:
        n["onError"] = on_error
        n["retryOnFail"] = True
        n["maxTries"] = 2
        n["waitBetweenTries"] = 5000
    return n

def qp(**kw):
    return {"sendQuery": True, "queryParameters": {"parameters": [{"name": k, "value": v} for k, v in kw.items()]}}

def assign(name, value, typ):
    return {"id": str(uuid.uuid4()), "name": name, "value": value, "type": typ}

nodes = [
    {"name": "Manual Test Run", "type": "n8n-nodes-base.manualTrigger", "typeVersion": 1,
     "position": [0, 0], "parameters": {}},
    {"name": "Weekdays 10:30 IST", "type": "n8n-nodes-base.scheduleTrigger", "typeVersion": 1.2,
     "position": [0, 200],
     "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "30 10 * * 1-5"}]}}},
    {"name": "Config", "type": "n8n-nodes-base.set", "typeVersion": 3.4, "position": [220, 100],
     "parameters": {"assignments": {"assignments": [
         assign("search_query", "Dental clinics in Chennai, India", "string"),
         assign("search_limit", 20, "number"),
         assign("speed_threshold_s", 3, "number"),
         assign("sheet_id", "PASTE_YOUR_GOOGLE_SHEET_ID_HERE", "string"),
     ]}, "options": {}}},
    http("Search Google Maps", [440, 100], {
        "url": "https://api.app.outscraper.com/maps/search-v3",
        **qp(query="={{ $json.search_query }}", limit="={{ $json.search_limit }}",
             language="en", region="IN", dropDuplicates="true", **{"async": "false"}),
    }, "httpHeaderAuth", 300000),
    {"name": "Read Leads Log", "type": "n8n-nodes-base.googleSheets", "typeVersion": 4.5,
     "position": [660, 100], "executeOnce": True, "alwaysOutputData": True,
     "parameters": {
         "operation": "read",
         "documentId": {"__rl": True, "mode": "id", "value": "={{ $('Config').first().json.sheet_id }}"},
         "sheetName": {"__rl": True, "mode": "name", "value": "Leads Log"},
         "options": {}}},
    code("Clean & Dedupe Leads", "clean-leads.js", [880, 100]),
    if_node("Has Website?", [1100, 100], cond("={{ $json.domain }}", "string", "notEmpty", single=True)),
    log_node("Log No Website", [1320, 300]),
    {"name": "Loop Over Leads", "type": "n8n-nodes-base.splitInBatches", "typeVersion": 3,
     "position": [1320, 0], "parameters": {"batchSize": 1, "options": {}}},
    http("PageSpeed Audit (Mobile)", [1540, 0], {
        "url": "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
        **qp(url="={{ $json.website }}", category="PERFORMANCE", strategy="MOBILE"),
    }, "httpQueryAuth", 120000, on_error="continueRegularOutput"),
    code("Extract Speed Metrics", "extract-metrics.js", [1760, 0], each=True),
    if_node("Slow Site?", [1980, 0], cond("={{ $json.status }}", "string", "equals", "slow")),
    http("Find Owner Email (Hunter)", [2200, -100], {
        "url": "https://api.hunter.io/v2/domain-search",
        **qp(domain="={{ $json.domain }}", limit="10"),
    }, "httpQueryAuth", 30000, on_error="continueRegularOutput"),
    code("Pick Decision Maker", "pick-contact.js", [2420, -100], each=True),
    if_node("Email Found?", [2640, -100], cond("={{ $json.email }}", "string", "notEmpty", single=True)),
    {"name": "Send Audit Email", "type": "n8n-nodes-base.gmail", "typeVersion": 2.1,
     "position": [2860, -200], "webhookId": str(uuid.uuid4()),
     "parameters": {
         "sendTo": "={{ $json.email }}",
         "subject": "=Quick fix for {{ $json.business_name }}'s mobile conversion drop?",
         "emailType": "html",
         "message": "=" + read("email.html"),
         "options": {"appendAttribution": False, "senderName": "S. Saktheeswaran"}}},
    code("Mark Sent", "mark-sent.js", [3080, -200], each=True),
    log_node("Log Sent", [3300, -200]),
    {"name": "Wait 2-3 min", "type": "n8n-nodes-base.wait", "typeVersion": 1.1,
     "position": [3520, -200], "webhookId": str(uuid.uuid4()),
     "parameters": {"amount": "={{ 120 + Math.floor(Math.random() * 61) }}", "unit": "seconds"}},
    log_node("Log Skipped", [2860, 150]),
]

for n in nodes:
    n["id"] = str(uuid.uuid5(uuid.NAMESPACE_URL, "astra-n8n/" + n["name"]))

def link(*pairs):
    c = {}
    for src, out, dst in pairs:
        outs = c.setdefault(src, {"main": []})["main"]
        while len(outs) <= out:
            outs.append([])
        outs[out].append({"node": dst, "type": "main", "index": 0})
    return c

connections = link(
    ("Manual Test Run", 0, "Config"),
    ("Weekdays 10:30 IST", 0, "Config"),
    ("Config", 0, "Search Google Maps"),
    ("Search Google Maps", 0, "Read Leads Log"),
    ("Read Leads Log", 0, "Clean & Dedupe Leads"),
    ("Clean & Dedupe Leads", 0, "Has Website?"),
    ("Has Website?", 0, "Loop Over Leads"),
    ("Has Website?", 1, "Log No Website"),
    ("Loop Over Leads", 1, "PageSpeed Audit (Mobile)"),   # output 1 = "loop"
    ("PageSpeed Audit (Mobile)", 0, "Extract Speed Metrics"),
    ("Extract Speed Metrics", 0, "Slow Site?"),
    ("Slow Site?", 0, "Find Owner Email (Hunter)"),
    ("Slow Site?", 1, "Log Skipped"),
    ("Find Owner Email (Hunter)", 0, "Pick Decision Maker"),
    ("Pick Decision Maker", 0, "Email Found?"),
    ("Email Found?", 0, "Send Audit Email"),
    ("Email Found?", 1, "Log Skipped"),
    ("Send Audit Email", 0, "Mark Sent"),
    ("Mark Sent", 0, "Log Sent"),
    ("Log Sent", 0, "Wait 2-3 min"),
    ("Wait 2-3 min", 0, "Loop Over Leads"),
    ("Log Skipped", 0, "Loop Over Leads"),
)

wf = {
    "name": "Astra Nexora — Maps Lead Audit & Outreach",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1", "timezone": "Asia/Kolkata", "saveManualExecutions": True},
    "pinData": {},
}
(HERE.parent / "workflow.json").write_text(json.dumps(wf, indent=2, ensure_ascii=False) + "\n")
print("wrote workflow.json with", len(nodes), "nodes")
