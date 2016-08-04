import article from './article';
import flags from './flags';
import spreadsheet from './spreadsheet';

export default async function() {
  const d = await article();
  const f = await flags();

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
