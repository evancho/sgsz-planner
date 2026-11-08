/** 政廳漢室轉換。群轉漢與漢轉群各最多 3 名，兩種方向不能同時。 */

const TO_HAN = [
  'caocao',
  'liubei',
  'sunjian',
  'gongsunzan',
  'lvbu',
  'jiaxu',
  'sp-yuanshao',
  'sp-xunyu',
  'yuanshu',
];

export const hanConvert = {
  status: '已核',
  max: 3,
  source: 'https://sgsdeck.com/seasons/pk-s27',
  officialPost: 'https://www.facebook.com/100064157226677/posts/1545693490912544/',
  note: '依 sgsdeck 漢焰總覽。群轉漢自選最多 3 名；自動轉漢與漢陣營新武將可轉回群，最多 3 名。有轉群就不能同時轉漢，反之亦然。',
  toHan: TO_HAN,
  /** 兼容舊欄位。 */
  ids: TO_HAN,
};
