import dns from 'node:dns';

dns.lookup('google.com', (err, address, family) => {
  console.log('google.com:', address);
});

dns.lookup('supabase.co', (err, address, family) => {
  console.log('supabase.co:', address);
});

const suspectedHost = 'sdcfclsrhazrxgyydnso.supabase.co';
console.log('Testing suspected host:', suspectedHost);
dns.lookup(suspectedHost, (err, address, family) => {
  if (err) {
      console.error('Lookup failed for', suspectedHost, ':', err.code);
  } else {
      console.log(suspectedHost, ':', address);
  }
});
