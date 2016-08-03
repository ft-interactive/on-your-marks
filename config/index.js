import article from './article';
import flags from './flags';
import spreadsheet from './spreadsheet';

export default async function() {
  const d = await article();
  const f = await flags();

  /*
  An experimental demo that gets content from the API
  and overwrites some model values. This requires the Link File
  to have been published. Also next-es-interface.ft.com probably
  isn't a reliable source. Also this has no way to prevent development
  values being seen in productions... use with care.

  try {
    const a = (await axios(`https://next-es-interface.ft.com/content/${d.id}`)).data;
    d.headline = a.title;
    d.byline = a.byline;
    d.summary = a.summaries[0];
    d.title = d.title || a.title;
    d.description = d.description || a.summaries[1] || a.summaries[0];
    d.publishedDate = new Date(a.publishedDate);
    f.comments = a.comments;
  } catch (e) {
    console.log('Error getting content from content API');
  }

  */

  const config = {
    ...d,
    flags: f,
    ...spreadsheet.options,
    levels: spreadsheet.levels,
  };

  return {
    ...config,
    _config: config, // HACK for nunjucks, which apparently doesn't have 'this' as a self-lookup
  };
}
