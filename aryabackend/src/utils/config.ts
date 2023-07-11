const SITE_SETTINGS = {
  email: {
    type: 'smtp',
    host: 'smtp.hostinger.com',
    secure: true,
    port: 465,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'arya@testingserver.host',
      pass: 'Wolfizer@2020',
    },
  },
  fromMail: 'arya@testingserver.host',
};
export default SITE_SETTINGS;
