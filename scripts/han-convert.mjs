/** 政廳漢室轉換。最多 3 名依 sgsdeck 仍待確認；方向互斥與漢將可轉群依使用者指定。 */

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
  status: '待核',
  max: 3,
  source: 'https://sgsdeck.com/seasons/pk-s27',
  officialPost: 'https://www.facebook.com/100064157226677/posts/1545693490912544/',
  note: '群轉漢自選最多 3 名、漢轉群最多 3 名依 sgsdeck，仍待確認。方向互斥與漢將都可轉群依使用者指定。',
  toHan: TO_HAN,
  /** 兼容舊欄位。 */
  ids: TO_HAN,
};
