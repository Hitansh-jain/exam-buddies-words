// Stopwords: common words we DON'T make clickable in the reader.
// Helping verbs, articles, pronouns, prepositions, common connectors, numbers etc.
export const STOPWORDS = new Set<string>([
  // articles
  "a","an","the",
  // pronouns
  "i","me","my","mine","myself","we","us","our","ours","ourselves",
  "you","your","yours","yourself","yourselves","he","him","his","himself",
  "she","her","hers","herself","it","its","itself","they","them","their",
  "theirs","themselves","this","that","these","those","who","whom","whose",
  "which","what","whatever","whoever",
  // helping / common verbs
  "am","is","are","was","were","be","been","being","have","has","had","having",
  "do","does","did","doing","done","will","would","shall","should","can","could",
  "may","might","must","ought","need","dare","used",
  // to be / go / say / get / make / know common forms
  "go","goes","went","gone","going","say","says","said","get","gets","got",
  "gotten","getting","make","makes","made","making","know","knows","knew","known",
  "come","comes","came","coming","see","sees","saw","seen","take","takes","took",
  "taken","give","gave","given","find","found","think","thought","tell","told",
  "put","puts","let","lets",
  // prepositions
  "of","in","on","at","by","for","with","about","against","between","into",
  "through","during","before","after","above","below","to","from","up","down",
  "over","under","again","further","then","once","upon","across","along","around",
  "behind","beside","near","off","out","past","since","toward","towards","within",
  "without","among",
  // conjunctions / connectors
  "and","but","or","nor","so","yet","because","as","if","while","when","where",
  "whereas","although","though","unless","until","till","whether","either",
  "neither","also","however","therefore","thus","hence","moreover","nevertheless",
  // determiners / quantifiers
  "all","any","both","each","few","more","most","other","others","some","such",
  "no","not","only","own","same","than","too","very","just","much","many","every",
  "several","enough",
  // small words / adverbs
  "here","there","how","why","yes","no","ok","okay","now","never","always","ever",
  "still","already","almost","perhaps","maybe","really","actually","quite","rather",
  "even","far","near","away","back","forward","again",
  // contractions bits
  "don","doesn","didn","won","wouldn","shouldn","couldn","isn","aren","wasn",
  "weren","haven","hasn","hadn","mustn","shan","mightn","needn","daren","let",
  "ll","ve","re","d","s","t","m",
  // days/months/simple time
  "day","days","night","nights","morning","evening","afternoon","today",
  "tomorrow","yesterday","week","month","year","years","hour","minute","second",
  // conversational
  "mr","mrs","miss","dr","sir","madam","lord","lady",
  // filler
  "one","two","three","four","five","six","seven","eight","nine","ten",
  "first","second","third","last","next","new","old","good","bad","big","small",
  "long","short","high","low","right","left","said","asked","replied","cried",
  "looked","turned","seemed","stood","walked","held","kept","felt","made",
]);

export function isLikelyToughWord(raw: string): boolean {
  const w = raw.toLowerCase();
  if (w.length < 4) return false;
  if (STOPWORDS.has(w)) return false;
  if (!/^[a-z][a-z'-]*$/.test(w)) return false;
  return true;
}
