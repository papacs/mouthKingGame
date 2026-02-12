type TwikooProxyContext = {
  request: Request;
  env?: { TWIKOO_ENV_ID?: string };
};

export const onRequest = async (context: TwikooProxyContext): Promise<Response> => {
  const url = new URL(context.request.url);
  const targetQuery = new URLSearchParams(url.search);
  const incomingEnv = targetQuery.get('env');
  const boundEnvId = context.env?.TWIKOO_ENV_ID?.trim();
  if (incomingEnv === '/twikoo') {
    if (boundEnvId) {
      targetQuery.set('env', boundEnvId);
    } else {
      targetQuery.delete('env');
    }
  }
  const queryText = targetQuery.toString();
  const targetUrl = `https://cwd.liucfamily.cn/${queryText ? `?${queryText}` : ''}`;

  const headers = new Headers(context.request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', url.host);
  headers.set('x-forwarded-proto', url.protocol.replace(':', ''));

  const method = context.request.method.toUpperCase();
  const shouldHaveBody = !['GET', 'HEAD'].includes(method);
  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body: shouldHaveBody ? context.request.body : undefined,
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
