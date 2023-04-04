import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';

const compartment = new Compartment({
  snap,
  Reflect,
});

const permittedDomains = new Set();

const warning = panel([
  text(
    `The domain at **${origin}** would like unmitigated access to your wallet.`,
  ),
  text(
    `You should only grant this if it's a site you trust with your entire wallet. Probably only do this if you're a developer and have read the source code of the site you're connecting to.`,
  ),
  text(
    `Oh, or if you're using a test wallet! Use a test wallet for development. That's a great idea anyways.`,
  ),
])

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  let approved;
  const { params } = request;
  const code = params && Array.isArray(params) && params[0];
  switch (request.method) {
    case 'requestPermissions':
      approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Confirmation',
          content: warning,
        },
      });

      if (approved) {
        permittedDomains.add(origin);
        return true;
      }
      return false;
    case 'evaluate':
      if (!permittedDomains.has(origin)) {
        throw new Error('Origin not permitted to evaluate code.');
      }

      if (!('params' in request) || !code || typeof code !== 'string') {
        throw new Error('Evaluate method requires a string to evaluate.');
      }
      return compartment.evaluate(code);
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
