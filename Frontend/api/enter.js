import { connectToDatabase, UserModel } from './_db.js';

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectToDatabase();
    const body = req.body ?? (await readBody(req));
    const tlgid = Number(body?.tlgid);

    if (!tlgid) {
      res.status(400).json({ statusBE: 'notOk', error: 'tlgid is required' });
      return;
    }

    const user = await UserModel.findOne({ tlgid });

    if (!user) {
      const newUser = new UserModel({ tlgid });
      await newUser.save();
      res.json({ userData: { result: 'showOnboarding' } });
      return;
    }

    const { _id, ...userData } = user.toObject();
    userData.result = 'showIndexPage';
    res.json({ userData });
    return;
  } catch (err) {
    res.status(500).json({ statusBE: 'notOk', error: 'Server error' });
  }
}
