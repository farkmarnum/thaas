import CertWithValidation from './components/CertWithValidation';
import { DOMAIN } from './config';

const createCert = () => new CertWithValidation('mainCert', { domain: DOMAIN });

export default createCert;
