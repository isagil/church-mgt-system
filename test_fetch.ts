async function test() {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    console.error('URL missing');
    return;
  }
  
  console.log('URL Char Codes:', Array.from(url).map(c => c.charCodeAt(0)));
  
  try {
    console.log('Fetching Supabase URL head...');
    const res = await fetch(url.trim(), { method: 'HEAD' });
    console.log('Status:', res.status);
  } catch (e: any) {
    console.error('Fetch error:', e.message);
    if (e.cause) {
        console.error('Cause:', e.cause);
    }
  }
}
test();
