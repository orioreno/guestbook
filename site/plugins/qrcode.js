import * as QRCode from 'easyqrcodejs';

export default (context, inject) => {

  const createQR = (object, text, title, subtitle) => {
    var options = {
      text: text,
      title: title,
      titleTop: 15,
      titleFont: "bold 16px sans-serif",
      titleColor: "#000000",
      titleBackgroundColor: "#ffffff",
      titleHeight: 50,
      subTitle: subtitle,
      subTitleFont: "14px sans-serif",
      subTitleColor: "#000000",
      subTitleTop: 35,
      width: 400,
      height: 400,
      colorDark : "#000000",
      colorLight : "#ffffff",
      quietZone: '10',
    }

    new QRCode(object, options);
  }
  inject('createQR', createQR);
}
