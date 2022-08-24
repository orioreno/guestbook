import * as QRCode from 'easyqrcodejs';

export default (context, inject) => {
  const createQR = (object, options) => new QRCode(object, options);
  inject('createQR', createQR);
}
