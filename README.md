Web-based vanilla Hearthstone currently in development.

Run `npm install` and then `npm start` to run the website.

To-do List:

- Get all card images and sound effects. Most are now in the files but some are sporadically missing.

- Tidy up HTML and CSS. Start using something like storybook for the html/css elements, so they can be developed without having to play the entire game. https://storybook.js.org/docs/get-started

- Implement several screens (menu, game, card collection, etc.).

- Organize the content of javascript scripts into objects or separate single-use scripts as much as possible.

- Make individual events update the client's game state instead of sending the entire game state each time and having the client reload everything.

- Do animations...

  - Draw card https://animista.net/play/entrances/slit-in
  - Show what card opponent is playing https://animista.net/play/entrances/tilt-in-fwd/tilt-in-fwd-tr
  - Place minion https://animista.net/play/entrances/puff-in/puff-in-center
  - Shuffle card back into deck https://animista.net/play/exits/slit-out
  - Burn/overdraw card https://animista.net/play/exits/puff-out
  - Minion dies https://animista.net/play/attention/shake

- For visuals: three.js? https://youtu.be/e2ntx-fyXaE
