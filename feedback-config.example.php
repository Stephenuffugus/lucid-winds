<?php
/**
 * feedback-config.example.php
 *
 * Copy this file to `feedback-config.php` (same folder, without `.example`)
 * on the server via Hostinger's File Manager. The real `feedback-config.php`
 * is in .gitignore and will NEVER be committed to the repo.
 *
 * This is read by api/feedback.php when a player submits the in-game
 * "Found a bug or have an idea?" form. No Firebase, no database — each
 * submission is emailed to the address below, where your Hostinger inbox
 * rules can auto-sort by the subject tag (e.g. [LW][BUG][glyphforge]).
 */

return [
  // WHERE feedback is delivered. Use a real mailbox you own on the domain
  // (create it in hPanel → Emails). All player submissions land here.
  'to'    => 'feedback@lucidwinds.com',

  // FROM address for the notification. It MUST be a real mailbox that
  // exists on lucidwinds.com, or Hostinger will refuse to send. Players
  // never see this — it's just the envelope sender.
  'from'  => 'noreply@lucidwinds.com',

  // Optional shared token. If set (non-empty), the client must send the
  // same value or the POST is rejected — a light gate against drive-by
  // spam to the endpoint. Set the SAME string in feedback.js (LW_FB_TOKEN).
  // Leave '' to disable.
  'token' => '',
];
