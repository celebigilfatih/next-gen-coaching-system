import { json, urlencoded } from 'express';
import type { RequestHandler, ErrorRequestHandler } from 'express';

/** Register before Nest's default parser. Only explicit tactical writes get 600 KB. */
export function tacticalBodyParser(): RequestHandler {
  const documentParser = json({ limit: 600_000 });
  const defaultParser = json({ limit: '100kb' });
  const paths = [
    /^\/drills\/[^/]+\/tactical-document\/?$/,
    /^\/drills\/[^/]+\/tactical-editor\/?$/,
    /^\/training-plans\/[^/]+\/drills\/[^/]+\/tactical-document\/?$/,
    /^\/seasons\/matches\/[^/]+\/tactical-document\/?$/,
  ];
  return (req, res, next) => {
    const parser =
      (req.method === 'PUT' && paths.some((path) => path.test(req.path))) ||
      (req.method === 'POST' && /^\/drills\/tactical-editor\/?$/.test(req.path))
        ? documentParser
        : defaultParser;
    parser(req, res, next);
  };
}

// Do not echo body-parser's error/body in responses or logs.
export const tacticalParserError: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  const type = (error as { type?: string })?.type;
  if (type === 'entity.too.large') {
    res.status(413).json({ statusCode: 413, message: 'Payload too large' });
    return;
  }
  if (type === 'entity.parse.failed') {
    res.status(400).json({ statusCode: 400, message: 'Invalid JSON' });
    return;
  }
  const status = (error as { status?: number })?.status;
  if (status === 400 || status === 415) {
    res
      .status(status)
      .json({ statusCode: status, message: 'Invalid request body' });
    return;
  }
  next(error);
};

export function configureBodyParsers(app: {
  use: (...handlers: unknown[]) => unknown;
}) {
  app.use(tacticalBodyParser());
  app.use(urlencoded({ extended: true, limit: '100kb' }));
  app.use(tacticalParserError);
}
