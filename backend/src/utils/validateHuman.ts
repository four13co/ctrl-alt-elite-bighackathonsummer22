import fetch from 'node-fetch';

const validateHuman = async (recaptchaToken: string): Promise<boolean> => {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    { method: 'POST' },
  );
  const data = await response.json();
  return data.success;
};

export { validateHuman };
