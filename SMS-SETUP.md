# Owner SMS notifications — connection plan

Recipient: **+18588882707**. Email recipient: **arsenij.moshko@gmail.com**.

Email and SMS are separate delivery channels. FormSubmit activation does not activate SMS. Existing customer `sms:` links only open the customer's messaging application.

## Pending owner setup

The owner confirmed no existing SMS service account. No account, paid subscription, sender number or SMS registration has been purchased or activated.

Candidate: Twilio Programmable Messaging. The owner must create and control the account, billing and sender registration. Do not post credentials in chat or add them to this static website. The business's current phone stays the notification recipient; do not port it to a new provider for this integration.

Official references checked November 18, 2026:

- https://www.twilio.com/en-us/sms/pricing/us — US long-code number starts at $1.15/month; outbound SMS starts at $0.0083/segment. Carrier, registration and other applicable charges are additional. This is not an all-in estimate.
- https://www.twilio.com/docs/messaging/tutorials/how-to-send-sms-messages — sender and messaging setup.
- https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/quickstart — US local-number registration prerequisites. Toll-free senders instead require their relevant verification.

## Implementation boundary

GitHub Pages cannot keep server secrets or execute a private SMS API call. A verified server-side endpoint or owner-authorized email-to-SMS automation is required. Choose and authorize that hosting/automation before deployment.

Keep Twilio account credentials in the server's secret store. Fix the recipient server-side to +18588882707; never accept arbitrary SMS recipients or arbitrary message bodies from the public browser. Validate incoming requests, authenticate delivery callbacks/webhooks, limit abuse, and deduplicate notifications using the request reference.

Proposed alert: `Restore Theory: new detail request [reference]. [service], [size], [customer name], [callback number]. Check email for details.` Do not send customer-facing marketing or confirmation texts as part of owner alerts.

Email receipt and SMS delivery must have separate statuses. An SMS API acceptance is not proof that the owner received the SMS; verify delivery status and an actual test on the recipient's phone. An SMS failure must not erase an already accepted email request or prompt a duplicate customer booking request.

Before enabling: confirm account access, approved sender and applicable registration, costs, private runtime, and one real received SMS. Until then, do not claim SMS notifications are connected.
