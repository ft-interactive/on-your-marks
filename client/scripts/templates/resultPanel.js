export default level => [
  `<h4>${level.getReactionTime()}</h4>`,
  (level.allowRetry ? '<p><button class="retry-button">Retry</button></p>' : ''),
  '<p><i>pretty results table TKTK</i></p>',
  `<p><a href="#${level.nextLevel.slug}">${level.nextLevel.isRestart ? 'Play again:' : 'Next up:'} ${level.nextLevel.name}</a></p>`,
].join('');
