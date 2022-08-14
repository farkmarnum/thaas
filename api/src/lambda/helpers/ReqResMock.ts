const ReqResMock = ({
  path,
  headers: reqHeaders,
}: {
  path: string;
  headers: Record<string, any>;
}) => {
  const { DOMAIN } = process.env;
  if (!DOMAIN) throw new Error('DOMAIN must be set!');

  // REQUEST:
  const req = {
    url: `https://${DOMAIN}/${path}`,
    headers: reqHeaders,
  };

  // RESPONSE:
  const state = {
    statusCode: 200,
    body: '',
    headers: {} as Record<string, any>,
  };
  const res = {
    setHeader: (key: string, value: string) => {
      state.headers[key] = value;
    },
    getHeader: (key: string) => state.headers[key],
    writeHead: (newStatusCode: number, newHeaders: Record<string, any>) => {
      state.statusCode = newStatusCode;
      if (newHeaders) {
        Object.entries(newHeaders).forEach(([k, v]) => {
          state.headers[k] = v;
        });
      }
    },
    end: (newBody: string) => {
      state.body = newBody;
    },
    state,
  };

  return {
    req,
    res,
  };
};

export default ReqResMock;
