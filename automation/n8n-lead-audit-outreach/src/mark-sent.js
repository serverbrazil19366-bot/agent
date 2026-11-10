// Code node "Mark Sent" (Run Once for Each Item)
// The Gmail node returns only the message id, so restore the lead data.
return {
  json: {
    ...$('Pick Decision Maker').item.json,
    status: 'sent',
    note: 'gmail id ' + ($json.id || ''),
  },
};
