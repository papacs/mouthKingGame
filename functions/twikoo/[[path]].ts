type TwikooProxyContext = {
  request: Request;
  params: { path?: string | string[] };
};

export const onRequest = async (context: TwikooProxyContext): Promise<Response> => {
  const url = new URL(context.request.url);
  const tail = context.params.path;
  const suffix = Array.isArray(tail) ? tail.join('/') : tail ?? '';
  const targetUrl = `https://cwd.liucfamily.cn/${suffix}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', url.host);
  headers.set('x-forwarded-proto', url.protocol.replace(':', ''));

  const upstream = await fetch(targetUrl, {
    method: context.request.method,
    headers,
    body: context.request.body,
    redirect: 'follow'
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('access-control-allow-origin');
  responseHeaders.delete('access-control-allow-credentials');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
};
