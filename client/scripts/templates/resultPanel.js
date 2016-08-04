export default level => [
  `<h4>${level.getReactionTime()}</h4>`,
  '<p><i>pretty results table TKTK</i></p>',
  `<p><a href="#${level.nextLevel.slug}">${level.nextLevel.isRestart ? 'Play again:' : 'Next up:'} ${level.nextLevel.name}</a></p>`,
].join('');
