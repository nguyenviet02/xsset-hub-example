import { BN } from 'bn.js';
import { createTransfer } from 'its-stg-pp';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getApiInstance } from '../../core/api';

const get: NextApiHandler = async (request: NextApiRequest, response: NextApiResponse) => {
  response.status(200).json({ message: 'Hello from the API!' });
};

const post: NextApiHandler = async (request: NextApiRequest, response: NextApiResponse) => {
  const { sender, transferField } = JSON.parse(request.body);
  const apiInstance = await getApiInstance();
  try {
    const transaction = await createTransfer(apiInstance, sender, {
      recipient: transferField.recipient,
      amount: new BN(transferField.amount),
      reference: transferField.reference,
    });
    if (transaction) {
      response.status(200).send({ transaction, message: 'Transaction created' });
    }
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
};

const index: NextApiHandler = async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') return get(request, response);
  if (request.method === 'POST') return post(request, response);

  throw new Error(`Unexpected method ${request.method}`);
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 5,
};

export default index;
