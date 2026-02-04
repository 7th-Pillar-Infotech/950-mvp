export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
];
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'];

export const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
  'mailinator.com', 'maildrop.cc', 'throwaway.email', 'fakeinbox.com',
  'trashmail.com', 'tempinbox.com', '10minutemail.com', '10minutemail.net',
  'minutemail.com', 'dispostable.com', 'mailnesia.com', 'tempail.com',
  'tempr.email', 'discard.email', 'discardmail.com', 'spamgourmet.com',
  'mytrashmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'grr.la', 'mailexpire.com', 'meltmail.com', 'yopmail.com',
  'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx',
  'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf',
  'monemail.fr.nf', 'monmail.fr.nf', 'getnada.com', 'tempmailo.com',
  'emailondeck.com', 'tempmailaddress.com', 'burnermail.io', 'mailsac.com',
  'inboxkitten.com', 'emailfake.com', 'fakemailgenerator.com', 'mohmal.com',
  'tempsky.com', 'trashinbox.com', 'dropmail.me', 'instantemailaddress.com',
  'crazymailing.com', 'throwawaymail.com', 'getairmail.com', 'mailcatch.com',
  'tmail.ws', 'tmpmail.org', 'tmpmail.net', 'tempmails.net', 'disposablemail.com',
];
