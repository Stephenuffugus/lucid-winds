# FTW popup surfaces, before the notification queue (2026-08-23)

Shot at 915x412 landscape, dsf2, touch, feedback chip hidden, driven through the
real menu, country pick and Deploy. `BEFORE1.png` is the contact sheet.

Step 1 of F4 in `satellites/flock-the-world/PLAN-AUG23.md` is to LOOK at every
popup as it is today before changing a line. What the sheet shows:

1. **A spend from the map is silent.** `#shToast` lives inside the sheet body, so
   with the sheet closed (`5-toast-sheet-closed`) the confirmation is nowhere on
   screen. The cash flash in the HUD is the only feedback. Every action taken
   from the F2 map popover lands here.
2. **Four identical toasts render as one, with no count**
   (`11-four-identical-toasts`). Each call overwrites the last, so a burst reads
   as a single event.
3. **A breaking banner fired during a modal is wasted** (`10-modal-plus-banner`).
   It renders behind the modal scrim and its 5 second timer runs out while the
   player is still reading the modal.
4. **There is one toast slot, not a stack.** Two events in the same second cannot
   both be seen.

Also confirmed working and worth not breaking: the guide card, the red and gold
banner variants, the event and doctrine modals, the cash flash, and the region
lost banner (which correctly names the vendor from F3).
