export const A1_PHRASES = [
  {
    id: 'a1-phrase-1',
    wrong: 'Ihr machen Hausaufgaben',
    correct: 'Ihr macht Hausaufgaben',
    type: 'correction',
    de: '„machen" ist falsch. Mit „ihr" muss das Verb „macht" verwendet werden (2. Person Plural).',
    ar: '«machen» خطأ. مع ضمير «ihr» يجب استخدام «macht» (المضارع، الجمع المخاطب).',
  },
  {
    id: 'a1-phrase-2',
    wrong: 'Du fährst nach Berlin',
    correct: 'Du fährst nach Berlin',
    type: 'correct',
    de: 'Dieser Satz ist korrekt! „fährst" ist die richtige Konjugation für „du" beim Verb „fahren".',
    ar: 'هذه الجملة صحيحة! «fährst» هو التصريف الصحيح للفعل «fahren» مع ضمير «du».',
  },
  {
    id: 'a1-phrase-3',
    wrong: 'Ich lernt Deutsch',
    correct: 'Ich lerne Deutsch',
    type: 'correction',
    de: '„lernt" ist die 3. Person Singular. Mit „ich" sagt man „lerne".',
    ar: '«lernt» تُستخدم للغائب المفرد. مع ضمير «ich» نقول «lerne».',
  },
  {
    id: 'a1-phrase-4',
    wrong: 'Das Kind fragen viel',
    correct: 'Das Kind fragt viel',
    type: 'correction',
    de: '„fragen" ist der Infinitiv. Mit „das Kind" (3. Person Singular) braucht man „fragt".',
    ar: '«fragen» هو المصدر. مع «das Kind» (الغائب المفرد) يجب استخدام «fragt».',
  },
];

export const A2_PHRASES = [
  {
    id: 'a2-phrase-1',
    wrong: 'Ich habe nach Hause gegangen',
    correct: 'Ich bin nach Hause gegangen',
    type: 'correction',
    de: 'Verben der Bewegung wie „gehen" bilden das Perfekt mit „sein", nicht „haben".',
    ar: 'أفعال الحركة مثل «gehen» تكوّن زمن الماضي التام مع «sein» وليس «haben».',
  },
  {
    id: 'a2-phrase-2',
    wrong: 'Er hat den Brief geschreibt',
    correct: 'Er hat den Brief geschrieben',
    type: 'correction',
    de: 'Das Partizip II von „schreiben" ist „geschrieben", nicht „geschreibt".',
    ar: 'اسم المفعول من «schreiben» هو «geschrieben» وليس «geschreibt».',
  },
  {
    id: 'a2-phrase-3',
    wrong: 'Er will heute nicht arbeitet',
    correct: 'Er will heute nicht arbeiten',
    type: 'correction',
    de: 'Nach Modalverben wie „wollen" steht der Infinitiv, nicht das konjugierte Verb.',
    ar: 'بعد الأفعال الناقصة مثل «wollen» يأتي المصدر، وليس الفعل المُصرَّف.',
  },
  {
    id: 'a2-phrase-4',
    wrong: 'Ich habe gestern gestudiert',
    correct: 'Ich habe gestern studiert',
    type: 'correction',
    de: 'Das Partizip II von „studieren" lautet „studiert", nicht „gestudiert" – Verben auf -ieren bekommen kein „ge-" Präfix.',
    ar: 'أفعال الألمانية المنتهية بـ -ieren لا تأخذ البادئة «ge-»، فلفظ «studiert» هو الصحيح.',
  },
  {
    id: 'a2-phrase-5',
    wrong: 'Letztes Jahr habe ich nach Berlin gerist',
    correct: 'Letztes Jahr bin ich nach Berlin gereist',
    type: 'correction',
    de: 'Zwei Fehler: 1) „reisen" braucht „sein" im Perfekt (Bewegungsverb). 2) Das Partizip II lautet „gereist", nicht „gerist".',
    ar: 'خطآن: ١) الفعل «reisen» يستخدم «sein» في الماضي التام لأنه فعل حركة. ٢) اسم المفعول هو «gereist» وليس «gerist».',
  },
];

export const ALL_PHRASES = [...A1_PHRASES, ...A2_PHRASES];
