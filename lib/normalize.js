function iso(ts) {
  return ts ? new Date(ts * 1000).toISOString() : null;
}

export function normalizeReport(apiData, { type, target, urlId }) {
  const attr = apiData?.data?.attributes || {};
  const stats = attr.last_analysis_stats || {};
  const results = attr.last_analysis_results || {};

  const engines = Object.entries(results).map(([key, v]) => ({
    engine: v.engine_name || key,
    category: v.category || 'undetected',
    result: v.result || null
  }));

  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const harmless = stats.harmless || 0;
  const undetected = stats.undetected || 0;
  const total = malicious + suspicious + harmless + undetected;

  const verdict =
    malicious > 0 ? 'malicious' : suspicious > 0 ? 'suspicious' : 'clean';

  const details =
    type === 'url'
      ? {
          url: attr.url || target,
          title: attr.title || null,
          finalUrl: attr.last_final_url || null,
          httpResponseCode: attr.last_http_response_code || null,
          responseSize: attr.last_http_response_content_length ?? null,
          categories: Object.values(attr.categories || {}),
        }
      : {
          fileName: attr.meaningful_name || (attr.names && attr.names[0]) || null,
          otherNames: (attr.names || []).slice(0, 6),
          size: attr.size ?? null,
          typeDescription: attr.type_description || null,
          magic: attr.magic || null,
          md5: attr.md5 || null,
          sha1: attr.sha1 || null,
          sha256: attr.sha256 || target,
        };

  return {
    type,
    target,
    verdict,
    stats: { malicious, suspicious, harmless, undetected, total },
    reputation: attr.reputation ?? null,
    engines,
    details,
    tags: attr.tags || [],
    timesSubmitted: attr.times_submitted ?? null,
    firstSeen: iso(attr.first_submission_date),
    lastAnalysis: iso(attr.last_analysis_date),
    permalink:
      type === 'url'
        ? `https://www.virustotal.com/gui/url/${urlId}/detection`
        : `https://www.virustotal.com/gui/file/${attr.sha256 || target}/detection`
  };
}
