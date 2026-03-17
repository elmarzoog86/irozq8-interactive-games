import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'motion/react';
import { Users, Play, Clock, CheckCircle2, XCircle, Trophy, ArrowRight, Settings, ArrowLeft, Dices, GripHorizontal, EyeOff, ExternalLink , MessageSquare, MessageSquareOff} from "lucide-react";
import { TwitchChat } from './TwitchChat';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface TriviaGameProps {
  messages: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

type GamePhase = 'config' | 'joining' | 'playing' | 'round_results' | 'final_results';

interface Player {
  username: string;
  score: number;
  currentAnswer?: string;
  answerTime?: number;
  roundPoints?: number;
}

interface QuestionData {
  q: string;
  a: string;
  options: string[];
}

const ARABIC_QUESTIONS = [
  { q: "ما هي عاصمة إسبانيا؟", a: "مدريد", options: ["برشلونة", "فالنسيا", "إشبيلية", "مدريد"] },
  { q: "من هو الرسام الذي رسم لوحة (ليلة النجوم)؟", a: "فنسنت فان جوخ", options: ["بيكاسو", "دالي", "دافينشي", "فنسنت فان جوخ"] },
  { q: "كم عدد القلوب لدى الأخطبوط؟", a: "ثلاثة", options: ["1", "2", "ثلاثة", "4"] },
  { q: "ما هو الحيوان الذي يُعتبر رمزاً لدولة أستراليا؟", a: "الكنغر", options: ["الكوالا", "الكنغر", "الإيمو", "الكلب البري"] },
  { q: "ما هو العنصر الكيميائي الأساسي في الفحم والماس؟", a: "الكربون", options: ["الكربون", "الحديد", "الكالسيوم", "الصوديوم"] },
  { q: "في أي قارة تقع جبال الأنديز؟", a: "أمريكا الجنوبية", options: ["أوروبا", "آسيا", "أمريكا الجنوبية", "أفريقيا"] },
  { q: "ما هو الحيوان الثديي الوحيد القادر على الطيران المستمر؟", a: "الخفاش", options: ["السنجاب الطائر", "الخفاش", "الليمور الطائر", "البومة"] },
  { q: "ما هي عاصمة الهند؟", a: "نيودلهي", options: ["بومباي", "نيودلهي", "كلكتا", "كيرالا"] },
  { q: "ما هي أكبر صحراء حارة في العالم؟", a: "الصحراء الكبرى", options: ["الصحراء العربية", "صحراء غوبي", "الصحراء الكبرى", "صحراء أتاكاما"] },
  { q: "أي دولة تعد موطن الأصل لطبق السوشي؟", a: "اليابان", options: ["الصين", "اليابان", "تيلاند", "كوريا"] },
  { q: "كم عدد حواس الإنسان وفقًا للعلم الحديث؟", a: "أكثر من 5", options: ["5 فقط", "4", "أكثر من 5", "3"] },
  { q: "ما الإسم الذي يطلق على الخلايا المسؤولة عن نقل الأكسجين في الدم؟", a: "كريات الدم الحمراء", options: ["الخلايا البيضاء", "الصفائح الدموية", "البلازما", "كريات الدم الحمراء"] },
  { q: "من من الأنبياء سمي بـ (كليم الله)؟", a: "موسى عليه السلام", options: ["إبراهيم عليه السلام", "موسى عليه السلام", "عيسى عليه السلام", "محمد صلى الله عليه وسلم"] },
  { q: "ما هو العضو الذي يستمر في النمو طوال حياة الإنسان؟", a: "الأنف والأذن", options: ["العين", "الأنف والأذن", "القلب", "المعدة"] },
  { q: "ما هو الكوكب الذي يُطلق عليه (نجمة الصباح) أو (نجمة المساء)؟", a: "الزهرة", options: ["عطارد", "المريخ", "الزهرة", "المشتري"] },
  { q: "كم عدد عيون النحلة؟", a: "5", options: ["2", "4", "5", "8"] },
  { q: "أي من الغازات التالية يستخدم في تعبئة مناطيد الهواء؟", a: "الهيليوم", options: ["الأكسجين", "النيتروجين", "الهيليوم", "ثاني أكسيد الكربون"] },
  { q: "ما هي أكثر لغة يتحدث بها الناس كلغة أم؟", a: "الماندرين (الصينية)", options: ["الإنجليزية", "الإسبانية", "الماندرين (الصينية)", "الهندية"] },
  { q: "في أي دولة توجد مدينة دبي؟", a: "الإمارات", options: ["السعودية", "الكويت", "قطر", "الإمارات"] },
  { q: "من هو مؤلف سلسلة هاري بوتر؟", a: "ج. ك. رولينغ", options: ["تولكين", "ج. ك. رولينغ", "جورج ر. ر. مارتن", "ستيفن كينغ"] },
  { q: "ما هو البحر الذي يفصل بين أمريكا الجنوبية وأفريقيا؟", a: "المحيط الأطلسي", options: ["المحيط الهادئ", "البحر الأبيض المتوسط", "المحيط الأطلسي", "المحيط الهندي"] },
  { q: "متى تم إطلاق أول هاتف أيفون؟", a: "2007", options: ["2005", "2007", "2009", "2010"] },
  { q: "كم عدد أذرع نجم البحر؟", a: "5", options: ["4", "5", "6", "8"] },
  { q: "ما هو الجزء المسؤول عن توازن الجسم في دماغ الإنسان؟", a: "المخيخ", options: ["المخ الكبيرة", "النخاع المستطيل", "المخيخ", "الغدة النخامية"] },

  { q: "ما هي عاصمة كوريا الشمالية؟", a: "بيونغ يانغ", options: ["سيول", "بيونغ يانغ", "طوكيو", "بكين"] },
  { q: "من هو العالم الذي اكتشف البنسلين؟", a: "ألكسندر فلمنج", options: ["آينشتاين", "ألكسندر فلمنج", "نيوتن", "ماري كوري"] },
  { q: "في أي مدينة يقع مبنى الكولوسيوم؟", a: "روما", options: ["باريس", "مدريد", "روما", "أثينا"] },
  { q: "ما هو الكوكب الذي يطلق عليه الكوكب الأحمر؟", a: "المريخ", options: ["الزهرة", "المريخ", "زحل", "المشتري"] },
  { q: "كم عدد دول العالم العربي؟", a: "22", options: ["20", "21", "22", "23"] },
  { q: "ما هي أكبر جزيرة في العالم غير قارية؟", a: "جرينلاند", options: ["جاوا", "جرينلاند", "مدغشقر", "غينيا الجديدة"] },
  { q: "من هو الرسام الذي رسم لوحة (الموناليزا)؟", a: "ليوناردو دا فينشي", options: ["بيكاسو", "رامبرانت", "ليوناردو دا فينشي", "سلفادور دالي"] },
  { q: "ما هو أسرع طائر في العالم؟", a: "الصقر الشاهين", options: ["النعامة", "الصقر الشاهين", "النسر", "البومة"] },
  { q: "أين توجد ساعة بيغ بن؟", a: "لندن", options: ["باريس", "لندن", "نيويورك", "برلين"] },
  { q: "ما هي لغة دولة البرازيل الأصلية؟", a: "البرتغالية", options: ["الإسبانية", "البرتغالية", "الإنجليزية", "الفرنسية"] },
  { q: "متى وقعت الحرب العالمية الثانية؟", a: "1939", options: ["1918", "1939", "1945", "1914"] },
  { q: "ما هو المحيط الأكبر مساحة على كوكب الأرض؟", a: "المحيط الهادئ", options: ["المحيط الأطلسي", "المحيط الهندي", "المحيط الهادئ", "المحيط المتجمد"] },
  { q: "كم عدد الكلى في جسم الإنسان الطبيعي؟", a: "2", options: ["1", "2", "3", "4"] },
  { q: "ما هو أطول مضيق بحري في العالم؟", a: "مضيق ملقا", options: ["مضيق جبل طارق", "مضيق هرمز", "مضيق البوسفور", "مضيق ملقا"] },
  { q: "ما هي القارة التي تضم أكبر عدد من الدول المتجاورة؟", a: "أفريقيا", options: ["آسيا", "أفريقيا", "أوروبا", "أمريكا الجنوبية"] },
  { q: "ما هي الدولة الأكثر تعداداً للسكان في العالم؟", a: "الهند", options: ["الصين", "الهند", "الولايات المتحدة", "روسيا"] },
  { q: "ما هي أعلى قمة جبل في العالم؟", a: "إيفرست", options: ["كي 2", "كليمنجارو", "إيفرست", "ماكنيلي"] },
  { q: "أين يقع البحر الميت؟", a: "الأردن وفلسطين", options: ["السعودية", "مصر", "الأردن وفلسطين", "لبنان"] },
  { q: "ما هي أصغر دولة في العالم؟", a: "الفاتيكان", options: ["موناكو", "سان مارينو", "الفاتيكان", "توفالو"] },
  { q: "ما هو الحيوان الوحيد الذي لا يستطيع القفز؟", a: "الفيل", options: ["وحيد القرن", "الزرافة", "الفيل", "فرس النهر"] },
  { q: "ما هي وحدة قياس درجة الحرارة في النظام الدولي؟", a: "كلفن", options: ["سيليزيوس", "فهرنهايت", "كلفن", "درجة مئوية"] },
  { q: "من هو مكتشف الجاذبية الأرضية؟", a: "إسحاق نيوتن", options: ["ألبرت أينشتاين", "جاليليو جاليلي", "إسحاق نيوتن", "نيكولا تسلا"] },
  { q: "ما هو الطائر الذي يضع أكبر بيضة؟", a: "النعامة", options: ["البجع", "النعامة", "الإيمو", "النسر"] },
  { q: "في أي عام تم اكتشاف الأمريكتين بواسطة كولومبوس؟", a: "1492", options: ["1492", "1500", "1488", "1520"] },
  { q: "ما هي الشجرة التي ترمز للبنان؟", a: "شجرة الأرز", options: ["النخيل", "البلوط", "الصنوبر", "شجرة الأرز"] },
  { q: "ما هي المادة المكونة للماس؟", a: "الكربون", options: ["النيتروجين", "السيليكون", "الكربون", "الذهب"] },
  { q: "من الذي ألف كتاب مقدمة ابن خلدون؟", a: "ابن خلدون", options: ["ابن النفيس", "ابن خلدون", "الخوارزمي", "ابن رشد"] },
  { q: "ما هو السائل الأخضر المر في جسم الإنسان؟", a: "العصارة الصفراوية", options: ["اللعاب", "البلازما", "العصارة الصفراوية", "حمض المعدة"] },

  { q: "ما هي عاصمة أستراليا؟", a: "كانبرا", options: ["سيدني", "ملبورن", "كانبرا", "أديلايد"] },
  { q: "أين يوجد المقر الرئيسي للأمم المتحدة؟", a: "نيويورك", options: ["جنيف", "واشنطن", "نيويورك", "باريس"] },
  { q: "ما هو العنصر الكيميائي الذي رمزه Na؟", a: "الصوديوم", options: ["النيتروجين", "الصوديوم", "النيكل", "النيون"] },
  { q: "من هو الرسام الذي رسم لوحة العشاء الأخير؟", a: "ليوناردو دا فينشي", options: ["مايكل أنجلو", "رافاييل", "پيكاسو", "ليوناردو دا فينشي"] },
  { q: "كم عدد قارات العالم؟", a: "7", options: ["5", "6", "7", "8"] },
  { q: "ما هو أطول نهر في العالم؟", a: "النيل", options: ["الأمازون", "المسيسيبي", "النيل", "يانغتسي"] },
  { q: "ما هي أكبر دولة في العالم من حيث المساحة؟", a: "روسيا", options: ["كندا", "الولايات المتحدة", "الصين", "روسيا"] },
  { q: "ما هو الحيوان البري الأسرع؟", a: "الفهد", options: ["الأسد", "الغزال", "الفهد", "الحصان"] },
  { q: "في أي عام بدأت الحرب العالمية الأولى؟", a: "1914", options: ["1918", "1914", "1939", "1920"] },
  { q: "ما هي عاصمة إيطاليا؟", a: "روما", options: ["ميلانو", "فينيسيا", "روما", "نابولي"] },
  { q: "ما هي اللغة الأكثر تحدثاً في العالم كله (كلغة أولى وثانية)؟", a: "الإنجليزية", options: ["الصينية الماندرين", "الإسبانية", "الإنجليزية", "الهندية"] },
  { q: "كم عدد الأسنان في فم الإنسان البالغ الطبيعي؟", a: "32", options: ["30", "32", "34", "28"] },
  { q: "ما هو الغاز الذي يشكل النسبة الأكبر في الغلاف الجوي؟", a: "النيتروجين", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الهيدروجين"] },
  { q: "من اخترع المصباح الكهربائي؟", a: "توماس إديسون", options: ["نيكولا تسلا", "توماس إديسون", "ألكسندر بيل", "ألبرت أينشتاين"] },
  { q: "ما هي العملة الرسمية للمملكة المتحدة؟", a: "الجنيه الإسترليني", options: ["اليورو", "الجنيه الإسترليني", "الدولار", "الفرنك"] },
  { q: "كم يبلغ عدد كواكب المجموعة الشمسية؟", a: "8", options: ["7", "8", "9", "10"] },
  { q: "ما هو الكوكب الأقرب للشمس؟", a: "عطارد", options: ["الزهرة", "عطارد", "المريخ", "الأرض"] },
  { q: "ما هو المعدن السائل في درجة حرارة الغرفة؟", a: "الزئبق", options: ["الحديد", "النحاس", "الفضة", "الزئبق"] },
  { q: "أين تقع أهرامات الجيزة؟", a: "مصر", options: ["المكسيك", "بيرو", "مصر", "السودان"] },
  { q: "من هو أول إنسان يمشي على سطح القمر؟", a: "نيل أرمسترونج", options: ["يوري جاجارين", "باز ألدرين", "نيل أرمسترونج", "مايكل كولينز"] },
  { q: "ما هي عاصمة كندا؟", a: "أوتاوا", options: ["تورونتو", "فانكوفر", "أوتاوا", "مونتريال"] },
  { q: "أي عضو في جسم الإنسان ينتج الأنسولين؟", a: "البنكرياس", options: ["الكبد", "الكلى", "البنكرياس", "المعدة"] },
  { q: "من هو مؤلف رواية الخيميائي؟", a: "باولو كويلو", options: ["جابرييل جارسيا ماركيز", "فيكتور هوجو", "تشارلز ديكنز", "باولو كويلو"] },
  { q: "ما هو أصلب معدن على وجه الأرض؟", a: "الألماس", options: ["الحديد", "الذهب", "الألماس", "التيتانيوم"] },
  { q: "ما هي أكبر بحيرة عذبة في العالم من حيث الحجم؟", a: "بحيرة بايكال", options: ["بحيرة سوبيريور", "بحيرة فيكتوريا", "بحيرة تنجانيقا", "بحيرة بايكال"] },
  { q: "من الذي اكتشف البنسلين؟", a: "ألكسندر فلمنج", options: ["لويس باستير", "ماري كوري", "ألكسندر فلمنج", "إدوارد جينر"] },
  { q: "ما هو الحيوان الذي يُعتبر أكبر الثدييات في العالم؟", a: "الحوت الأزرق", options: ["الفيل الأفريقي", "القرش الأبيض", "الحوت الأزرق", "الزرافة"] },
  { q: "في أي مدينة يقع برج إيفل؟", a: "باريس", options: ["لندن", "روما", "باريس", "برلين"] },
  { q: "ما هو المركب الكيميائي للماء؟", a: "H2O", options: ["CO2", "H2O", "O2", "NaCl"] },
  { q: "ما هو العضو المسؤول عن ضخ الدم في الجسم؟", a: "القلب", options: ["الرئتين", "الكبد", "القلب", "الدماغ"] },
  { q: "ما هي عاصمة اليابان؟", a: "طوكيو", options: ["بكين", "سيول", "طوكيو", "أوساكا"] },

  { q: "ما هو العنصر الأساسي الذي يصنع منه الزجاج؟", a: "الرمل", options: ["الرمل", "الحديد", "الخشب", "البلاستيك"] },
  { q: "ما هي عاصمة كوريا الجنوبية؟", a: "سيول", options: ["بكين", "سيول", "طوكيو", "بانكوك"] },
  { q: "كم عدد الكواكب في نظامنا الشمسي؟", a: "8", options: ["7", "8", "9", "10"] },
  { q: "ما هي الدولة التي تمتلك أكبر عدد من الجزر؟", a: "السويد", options: ["إندونيسيا", "الفلبين", "السويد", "اليابان"] },
  { q: "ما هو المعدن السائل في درجة حرارة الغرفة؟", a: "الزئبق", options: ["الحديد", "النحاس", "الفضة", "الزئبق"] },
  { q: "من هو الحيوان الذي له بصمات تشبه بصمات الإنسان؟", a: "الكوالا", options: ["الشامبانزي", "الكوالا", "القرد", "الغوريلا"] },
  { q: "ما هو أعرض نهر في العالم؟", a: "الأمازون", options: ["النيل", "المسيسيبي", "الأمازون", "الغانج"] },
  { q: "كم عدد العظام في جسم الإنسان البالغ؟", a: "206", options: ["200", "206", "212", "218"] },
  { q: "ما هي لغة البرمجة الأكثر استخدامًا في تطوير الويب؟", a: "جافاسكربت", options: ["بايثون", "سي++", "جافاسكربت", "جافا"] },
  { q: "ما هو البحر الذي يفصل بين قارتي أوروبا وأفريقيا؟", a: "البحر الأبيض المتوسط", options: ["البحر الأحمر", "البحر الميت", "البحر الأبيض المتوسط", "البحر الأسود"] },
  { q: "من هي أول امرأة فازت بجائزة نوبل؟", a: "ماري كوري", options: ["روزاليند فرانكلين", "ماري كوري", "إيرين جوليو-كوري", "دوروثي هودجكن"] },
  { q: "ما هي الغدة الأكبر في جسم الإنسان؟", a: "الكبد", options: ["الكبد", "البنكرياس", "الغدة الدرقية", "الطحال"] },
  { q: "أين تقع أعلى شلالات في العالم؟", a: "فنزويلا", options: ["نيوزيلندا", "البرازيل", "الولايات المتحدة", "فنزويلا"] },
  { q: "ما هو أطول جسر فوق الماء في العالم؟", a: "جسر بحيرة بونتشارترين", options: ["جسر البوابة الذهبية", "جسر بروكلين", "جسر بحيرة بونتشارترين", "جسر دانيانغ-كونشان"] },
  { q: "ما هي العاصمة السابقة لليابان قبل طوكيو؟", a: "كيوتو", options: ["أوساكا", "نارا", "كيوتو", "سابورو"] },
  { q: "كم عدد سور القرآن الكريم؟", a: "114", options: ["110", "112", "114", "120"] },
  { q: "ما هي أطول سورة في القرآن الكريم؟", a: "البقرة", options: ["آل عمران", "النساء", "البقرة", "الكهف"] },
  { q: "من هو أول الخلفاء الراشدين؟", a: "أبو بكر", options: ["عمر بن الخطاب", "علي بن أبي طالب", "عثمان بن عفان", "أبو بكر"] },
  { q: "في أي شهر يصوم المسلمون؟", a: "رمضان", options: ["شعبان", "رجب", "رمضان", "شوال"] },
  { q: "ما هو أسرع حيوان بري في العالم؟", a: "الفهد", options: ["الأسد", "النمر", "الفهد", "الغزال"] },
  { q: "ما هو الغاز الذي نتنفسه لنعيش؟", a: "الأكسجين", options: ["النيتروجين", "الهيدروجين", "الأكسجين", "ثاني أكسيد الكربون"] },
  { q: "كم عدد حواس الإنسان؟", a: "5", options: ["4", "5", "6", "7"] },
  { q: "ما هو الحيوان الذي يسمى سفينة الصحراء؟", a: "الجمل", options: ["الحصان", "الجمل", "الفيل", "النعامة"] },
  { q: "ما هي الشركة المصنعة لسيارة موستانج؟", a: "فورد", options: ["شيفروليه", "دودج", "فورد", "تويوتا"] },
  { q: "أي دولة تصنع سيارات فيراري؟", a: "إيطاليا", options: ["ألمانيا", "فرنسا", "إيطاليا", "إسبانيا"] },
  { q: "ما هي الشركة التي تنتج سيارة كامري؟", a: "تويوتا", options: ["هوندا", "نيسان", "تويوتا", "مازدا"] },
  { q: "ما هو الكوكب الأحمر؟", a: "المريخ", options: ["الزهرة", "المشتري", "المريخ", "زحل"] },
  { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", a: "المشتري", options: ["زحل", "المشتري", "أورانوس", "نبتون"] },
  { q: "ما هو أقرب كوكب للشمس؟", a: "عطارد", options: ["الزهرة", "المريخ", "عطارد", "الأرض"] },
  { q: "ما هو الكوكب الذي نعيش عليه؟", a: "الأرض", options: ["المريخ", "الزهرة", "الأرض", "المشتري"] },
  { q: "ما هي عاصمة اليابان؟", a: "طوكيو", options: ["بكين", "سيول", "طوكيو", "بانكوك"] },
  { q: "ما هو أطول نهر في العالم؟", a: "النيل", options: ["الأمازون", "المسيسيبي", "النيل", "الفرات"] },
  { q: "في أي قارة تقع دولة البرازيل؟", a: "أمريكا الجنوبية", options: ["أفريقيا", "أمريكا الشمالية", "أمريكا الجنوبية", "أوروبا"] },
  { q: "ما هي عاصمة مصر؟", a: "القاهرة", options: ["الإسكندرية", "دمشق", "القاهرة", "بغداد"] },
  { q: "ما هي أصغر دولة في العالم؟", a: "الفاتيكان", options: ["موناكو", "سان مارينو", "الفاتيكان", "ليختنشتاين"] },
  { q: "ما هو لون الدم النقي؟", a: "أحمر", options: ["أزرق", "أخضر", "أحمر", "أصفر"] },
  { q: "كم عدد قارات العالم؟", a: "7", options: ["5", "6", "7", "8"] },
  { q: "ما هو حيوان الأكبر في العالم؟", a: "الحوت الأزرق", options: ["الفيل", "القرش الأبيض", "الحوت الأزرق", "الزرافة"] },
  { q: "ما هي لغة القرآن الكريم؟", a: "العربية", options: ["الإنجليزية", "الفارسية", "الأردية", "العربية"] },
  { q: "ما هو المعدن السائل في درجة حرارة الغرفة؟", a: "الزئبق", options: ["الحديد", "النحاس", "الزئبق", "الذهب"] },
  { q: "ما هي عاصمة المملكة العربية السعودية؟", a: "الرياض", options: ["جدة", "مكة المكرمة", "الرياض", "الدمام"] },
  { q: "من هو مكتشف الجاذبية؟", a: "إسحاق نيوتن", options: ["ألبرت أينشتاين", "إسحاق نيوتن", "جاليليو", "تسلا"] },
  { q: "ما هو العضو المسؤول عن ضخ الدم في الجسم؟", a: "القلب", options: ["الرئة", "الكبد", "القلب", "المعدة"] },
  { q: "كم عدد ألوان قوس قزح؟", a: "7", options: ["5", "6", "7", "8"] },
  { q: "ما هو أكبر محيط في العالم؟", a: "المحيط الهادئ", options: ["المحيط الأطلسي", "المحيط الهندي", "المحيط الهادئ", "المحيط المتجمد الشمالي"] },
  { q: "ما هي عاصمة فرنسا؟", a: "باريس", options: ["لندن", "برلين", "باريس", "مدريد"] },
  { q: "من هو مخترع المصباح الكهربائي؟", a: "توماس إديسون", options: ["نيكولا تسلا", "توماس إديسون", "ألكسندر جراهام بيل", "بنيامين فرانكلين"] },
  { q: "ما هو أثقل حيوان بري؟", a: "الفيل الأفريقي", options: ["وحيد القرن", "فرس النهر", "الفيل الأفريقي", "الزرافة"] },
  { q: "ما هو الرمز الكيميائي للماء؟", a: "H2O", options: ["CO2", "H2O", "O2", "NaCl"] },
  { q: "كم عدد أسنان الإنسان البالغ؟", a: "32", options: ["28", "30", "32", "34"] },
  { q: "ما هي عاصمة الكويت؟", a: "مدينة الكويت", options: ["الجهراء", "الفروانية", "مدينة الكويت", "حولي"] },
  { q: "من هو صاحب لقب 'سيف الله المسلول'؟", a: "خالد بن الوليد", options: ["عمر بن الخطاب", "علي بن أبي طالب", "خالد بن الوليد", "حمزة بن عبد المطلب"] },
  { q: "ما هو العلم الذي يدرس النجوم والكواكب؟", a: "علم الفلك", options: ["علم الجيولوجيا", "علم الفلك", "علم الأحياء", "علم الكيمياء"] },
  { q: "ما هي أكبر صحراء في العالم؟", a: "الصحراء الكبرى", options: ["صحراء جوبي", "الصحراء الكبرى", "صحراء الربع الخالي", "صحراء نجد"] },
  { q: "كم عدد أيام السنة الكبيسة؟", a: "366", options: ["364", "365", "366", "367"] },
  { q: "ما هو الطائر الذي لا يطير؟", a: "النعامة", options: ["الصقر", "النعامة", "البومة", "الحمام"] },
  { q: "ما هي عاصمة الإمارات العربية المتحدة؟", a: "أبوظبي", options: ["دبي", "الشارقة", "أبوظبي", "عجمان"] },
  { q: "من هو مؤلف كتاب 'القانون في الطب'؟", a: "ابن سينا", options: ["الرازي", "ابن سينا", "ابن رشد", "الفارابي"] },
  { q: "ما هو أصلب مادة طبيعية؟", a: "الألماس", options: ["الذهب", "الحديد", "الألماس", "الفولاذ"] },
  { q: "كم عدد لاعبي فريق كرة القدم؟", a: "11", options: ["9", "10", "11", "12"] },
  { q: "ما هي عاصمة الأردن؟", a: "عمان", options: ["الزرقاء", "إربد", "عمان", "العقبة"] },
  { q: "ما هو الحيوان الذي ينام وعيناه مفتوحتان؟", a: "الدلفين", options: ["السمك", "الدلفين", "الثعبان", "الأسد"] },
  { q: "ما هو الغاز الذي يستخدم في إطفاء الحرائق؟", a: "ثاني أكسيد الكربون", options: ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"] },
  { q: "كم عدد أضلاع المثلث؟", a: "3", options: ["3", "4", "5", "6"] },
  { q: "ما هي عاصمة قطر؟", a: "الدوحة", options: ["الوكرة", "الخور", "الدوحة", "الريان"] },
  { q: "من هو مكتشف قارة أمريكا؟", a: "كريستوفر كولومبوس", options: ["فاسكو دي جاما", "كريستوفر كولومبوس", "ماجلان", "ماركو بولو"] },
  { q: "ما هي أكبر جزيرة في العالم؟", a: "جرينلاند", options: ["مدغشقر", "جرينلاند", "أستراليا", "سومطرة"] },
  { q: "كم عدد فقرات العمود الفقري للإنسان؟", a: "33", options: ["30", "32", "33", "35"] },
  { q: "ما هو الكوكب الذي يلقب بـ 'توأم الأرض'؟", a: "الزهرة", options: ["المريخ", "الزهرة", "المشتري", "عطارد"] },
  { q: "ما هي عاصمة البحرين؟", a: "المنامة", options: ["المحرق", "الرفاع", "المنامة", "مدينة حمد"] },
  { q: "من هو مخترع الهاتف؟", a: "ألكسندر جراهام بيل", options: ["توماس إديسون", "ألكسندر جراهام بيل", "نيكولا تسلا", "ماركوني"] },
  { q: "ما هو أطول بناء في العالم؟", a: "برج خليفة", options: ["برج إيفل", "برج خليفة", "ساعة مكة", "برج شانغهاي"] },
  { q: "كم عدد شهور السنة الهجرية؟", a: "12", options: ["10", "11", "12", "13"] },
  { q: "ما هو الحيوان الذي يغير لونه؟", a: "الحرباء", options: ["الأخطبوط", "الحرباء", "الضفدع", "الثعبان"] },
  { q: "ما هي عاصمة عمان؟", a: "مسقط", options: ["صلالة", "صحار", "مسقط", "نزوى"] },
  { q: "من هو أول إنسان صعد إلى القمر؟", a: "نيل أرمسترونج", options: ["يوري جاجارين", "نيل أرمسترونج", "بز ألدرين", "مايكل كولينز"] },
  { q: "ما هو الفيتامين الذي نحصل عليه من الشمس؟", a: "فيتامين د", options: ["فيتامين أ", "فيتامين ب", "فيتامين ج", "فيتامين د"] },
  { q: "كم عدد صمامات القلب؟", a: "4", options: ["2", "3", "4", "5"] },
  { q: "ما هي عاصمة العراق؟", a: "بغداد", options: ["البصرة", "الموصل", "بغداد", "أربيل"] },
  { q: "ما هو أصغر كوكب في المجموعة الشمسية؟", a: "عطارد", options: ["المريخ", "عطارد", "نبتون", "الزهرة"] },
  { q: "من هو مؤلف رواية 'البؤساء'؟", a: "فيكتور هوجو", options: ["تشارلز ديكنز", "فيكتور هوجو", "ليون تولستوي", "شكسبير"] },
  { q: "ما هو العلم الذي يدرس الزلازل؟", a: "علم الزلازل", options: ["علم البراكين", "علم الزلازل", "علم الطقس", "علم المحيطات"] },
  { q: "كم عدد أرجل العنكبوت؟", a: "8", options: ["6", "8", "10", "12"] },
  { q: "ما هي عاصمة سوريا؟", a: "دمشق", options: ["حلب", "حمص", "دمشق", "اللاذقية"] },
  { q: "من هو مخترع الطائرة؟", a: "الأخوان رايت", options: ["ليوناردو دا فينشي", "الأخوان رايت", "هنري فورد", "جراهام بيل"] },
  { q: "ما هو أكبر خليج في العالم؟", a: "خليج المكسيك", options: ["الخليج العربي", "خليج المكسيك", "خليج البنغال", "خليج غينيا"] },
  { q: "كم عدد كواكب المجموعة الشمسية؟", a: "8", options: ["7", "8", "9", "10"] },
  { q: "ما هو الحيوان الذي يلقب بـ 'ملك الغابة'؟", a: "الأسد", options: ["النمر", "الفهد", "الأسد", "الفيل"] },
  { q: "ما هي عاصمة لبنان؟", a: "بيروت", options: ["طرابلس", "صيدا", "بيروت", "صور"] },
  { q: "من هو أول من رسم خريطة العالم؟", a: "الإدريسي", options: ["ابن بطوطة", "الإدريسي", "كولومبوس", "ماجلان"] },
  { q: "ما هو الغاز الذي يسبب الاحتباس الحراري؟", a: "ثاني أكسيد الكربون", options: ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الميثان"] },
  { q: "كم عدد أوتار العود؟", a: "11", options: ["10", "11", "12", "13"] },
  { q: "ما هي عاصمة السودان؟", a: "الخرطوم", options: ["أم درمان", "الخرطوم", "بورتسودان", "كسلا"] },
  { q: "من هو مخترع الراديو؟", a: "ماركوني", options: ["تسلا", "إديسون", "ماركوني", "بيل"] },
  { q: "ما هو أعمق محيط في العالم؟", a: "المحيط الهادئ", options: ["المحيط الأطلسي", "المحيط الهندي", "المحيط الهادئ", "المحيط المتجمد الجنوبي"] },
  { q: "كم عدد حروف اللغة العربية؟", a: "28", options: ["26", "27", "28", "29"] },
  { q: "ما هو الحيوان الذي لا يشرب الماء؟", a: "جرذ الكنغر", options: ["الجمل", "جرذ الكنغر", "الثعبان", "العقرب"] },
  { q: "ما هي عاصمة المغرب؟", a: "الرباط", options: ["الدار البيضاء", "مراكش", "الرباط", "طنجة"] },
  { q: "من هو مكتشف الدورة الدموية الكبرى؟", a: "ويليام هارفي", options: ["ابن النفيس", "ويليام هارفي", "باستور", "كوك"] },
  { q: "ما هو المعدن الذي يصدأ؟", a: "الحديد", options: ["النحاس", "الألمنيوم", "الحديد", "الذهب"] },
  { q: "كم عدد لاعبي فريق كرة السلة؟", a: "5", options: ["5", "6", "7", "8"] },
  { q: "ما هي عاصمة تونس؟", a: "تونس", options: ["صفاقس", "سوسة", "تونس", "بنزرت"] },
  { q: "من هو مخترع السينما؟", a: "الأخوان لوميير", options: ["إديسون", "الأخوان لوميير", "والت ديزني", "تشارلي تشابلن"] },
  { q: "ما هو أكبر بحر مغلق في العالم؟", a: "بحر قزوين", options: ["البحر الميت", "بحر قزوين", "البحر الأحمر", "البحر الأسود"] },
  { q: "كم عدد ألوان علم الكويت؟", a: "4", options: ["3", "4", "5", "6"] },
  { q: "ما هو الحيوان الذي ينام وهو واقف؟", a: "الحصان", options: ["البقرة", "الحصان", "الفيل", "الزرافة"] },
  { q: "ما هي عاصمة الجزائر؟", a: "الجزائر", options: ["وهران", "قسنطينة", "الجزائر", "عنابة"] },
  { q: "من هو صاحب لوحة 'الموناليزا'؟", a: "ليوناردو دا فينشي", options: ["بيكاسو", "ليوناردو دا فينشي", "مايكل أنجلو", "فان جوخ"] },
  { q: "ما هو الغاز الذي يستخدم في تعبئة المناطيد؟", a: "الهيليوم", options: ["الهيدروجين", "الهيليوم", "النيتروجين", "الأكسجين"] },
  { q: "كم عدد أسابيع السنة؟", a: "52", options: ["50", "51", "52", "53"] },
  { q: "ما هي عاصمة ليبيا؟", a: "طرابلس", options: ["بنغازي", "مصراتة", "طرابلس", "طبرق"] },
  { q: "من هو مخترع الطباعة؟", a: "يوهان جوتنبرج", options: ["ليوناردو دا فينشي", "يوهان جوتنبرج", "إديسون", "نيوتن"] },
  { q: "ما هو أكبر عضو في جسم الإنسان؟", a: "الجلد", options: ["الكبد", "الرئة", "الجلد", "الأمعاء"] },
  { q: "كم عدد القلوب لدى الأخطبوط؟", a: "3", options: ["1", "2", "3", "4"] },
  { q: "ما هي عاصمة موريتانيا؟", a: "نواكشوط", options: ["نواذيبو", "نواكشوط", "روصو", "أطار"] },
  { q: "من هو أول من صعد إلى الفضاء؟", a: "يوري جاجارين", options: ["نيل أرمسترونج", "يوري جاجارين", "جون جلين", "بز ألدرين"] },
  { q: "ما هو أطول جسر في العالم؟", a: "جسر دانيانغ-كونشان", options: ["جسر البوابة الذهبية", "جسر دانيانغ-كونشان", "جسر الملك فهد", "جسر الشيخ جابر"] },
  { q: "كم عدد عيون النحلة؟", a: "5", options: ["2", "3", "4", "5"] },
  { q: "ما هي عاصمة الصومال؟", a: "مقديشو", options: ["هرجيسا", "بوساسو", "مقديشو", "كيسمايو"] },
  { q: "من هو مخترع الديناميت؟", a: "ألفريد نوبل", options: ["أينشتاين", "ألفريد نوبل", "نيوتن", "تسلا"] },
  { q: "ما هو أصغر طائر في العالم؟", a: "طنين النحل", options: ["العصفور", "طنين النحل", "الببغاء", "الحمام"] },
  { q: "كم عدد الأوتار في الكمان؟", a: "4", options: ["3", "4", "5", "6"] },
  { q: "ما هي عاصمة جيبوتي؟", a: "جيبوتي", options: ["علي صبيح", "تاجورة", "جيبوتي", "أوبوك"] },
  { q: "من هو مؤلف مسرحية 'هاملت'؟", a: "شكسبير", options: ["شكسبير", "موليير", "برنارد شو", "أوسكار وايلد"] },
  { q: "ما هو أسرع طائر في العالم؟", a: "الصقر الجوال", options: ["النعامة", "الصقر الجوال", "النسر", "البومة"] },
  { q: "كم عدد أجنحة النحلة؟", a: "4", options: ["2", "4", "6", "8"] },
  { q: "ما هي عاصمة جزر القمر؟", a: "موروني", options: ["موتسامودو", "موروني", "فومبوني", "دوموني"] },
  { q: "من هو مخترع المحرك البخاري؟", a: "جيمس واط", options: ["نيوتن", "جيمس واط", "فورد", "إديسون"] },
  { q: "ما هو أثقل كوكب في المجموعة الشمسية؟", a: "المشتري", options: ["زحل", "المشتري", "الأرض", "نبتون"] },
  { q: "كم عدد أرجل النملة؟", a: "6", options: ["4", "6", "8", "10"] },
  { q: "ما هي عاصمة فلسطين؟", a: "القدس", options: ["رام الله", "غزة", "القدس", "نابلس"] },
  { q: "من هو مكتشف البنسلين؟", a: "ألكسندر فلمنج", options: ["لويس باستير", "ماري كوري", "ألكسندر فلمنج", "روبيرت كوخ"] },
  { q: "ما هو أكبر كوكب في النظام الشمسي؟", a: "المشتري", options: ["زحل", "المريخ", "الأرض", "المشتري"] },
  { q: "أين يقع تمثال الحرية؟", a: "في نيويورك", options: ["في واشنطن", "في نيويورك", "في لوس أنجلوس", "في شيكاغو"] },
  { q: "ما هو الحيوان الذي يُعرف بملك الغابة؟", a: "الأسد", options: ["النمر", "الفيل", "الذئب", "الأسد"] },
  { q: "ما هي العملة المستخدمة في اليابان؟", a: "الين", options: ["اليون", "اليورو", "الدولار", "الين"] },
  { q: "ما هي لغة البرمجة الأكثر شيوعاً؟", a: "جافاسكربت", options: ["سي", "جافاسكربت", "روبي", "بايثون"] },
  { q: "ما هي القارة التي تضم أكبر عدد من الدول؟", a: "أفريقيا", options: ["أوروبا", "آسيا", "أفريقيا", "أمريكا الجنوبية"] },
  { q: "من رسم لوحة الموناليزا؟", a: "ليوناردو دا فينشي", options: ["بيكاسو", "فان جوخ", "مايكل أنجلو", "ليوناردو دا فينشي"] },
  { q: "ما هي نسبة الماء في جسم الإنسان؟", a: "حوالي 60%", options: ["حوالي 40%", "حوالي 50%", "حوالي 60%", "حوالي 70%"] },
];

const PopoutWindow: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => {
  const newWindow = useRef<Window | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Open a new window
    const newWin = window.open('', 'StreamerControl', 'width=400,height=600,left=200,top=200');
    if (newWin) {
      newWindow.current = newWin;
      const div = newWin.document.createElement('div');
      newWin.document.body.appendChild(div);
      newWin.document.body.style.margin = '0';
      newWin.document.body.style.background = '#09090b'; // Tailwind bg-zinc-950
      newWin.document.body.style.color = '#fff';
      newWin.document.dir = 'rtl';

      // Copy styles from main window
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = newWin.document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            newWin.document.head.appendChild(link);
          } else if (styleSheet.cssRules) {
            const style = newWin.document.createElement('style');
            Array.from(styleSheet.cssRules).forEach((rule) => {
              style.appendChild(document.createTextNode(rule.cssText));
            });
            newWin.document.head.appendChild(style);
          }
        } catch (e) {
          // Ignore cross-origin stylesheet errors
        }
      });

      setContainer(div);

      const handleUnload = () => {
        onClose();
      };
      newWin.addEventListener('unload', handleUnload);

      return () => {
        newWin.removeEventListener('unload', handleUnload);
        newWin.close();
      };
    }
  }, []);

  return container ? ReactDOM.createPortal(children, container) : null;
};

export const TriviaGame: React.FC<TriviaGameProps> = ({ messages, onLeave, channelName, isConnected, error }) => {
  const [showChat, setShowChat] = useState(true);
  const [phase, setPhase] = useState<GamePhase>('config');
  const [settings, setSettings] = useState({ numQuestions: 10, timePerQuestion: 15 });
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [streamerSecretAnswer, setStreamerSecretAnswer] = useState('');
  const [lockedStreamerAnswer, setLockedStreamerAnswer] = useState('');
  const [showStreamerBox, setShowStreamerBox] = useState(true);
  const [isPopoutOpen, setIsPopoutOpen] = useState(false);
  
  const processedMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    messages.forEach(msg => {
      if (!processedMessageIds.current.has(msg.id)) {
        processedMessageIds.current.add(msg.id);
        
        const text = msg.message.trim();
        const userId = msg.username.toLowerCase();
        
        if (phase === 'joining' && text.toLowerCase() === '!join') {
          setPlayers(prev => {
            if (!prev[userId]) {
              return { ...prev, [userId]: { username: msg.username, score: 0 } };
            }
            return prev;
          });
        } else if (phase === 'playing' && timeLeft !== null && timeLeft > 0) {
            setPlayers(prev => {
              const player = prev[userId];
              if (player && !player.currentAnswer) {
                // Convert Arabic numerals to English and capture only standalone numbers
                const englishText = text.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                const numMatch = englishText.match(/\b\d+\b/);
                if (!numMatch) return prev;              const answer = numMatch[0];
              return {
                ...prev,
                [userId]: {
                  ...player,
                  currentAnswer: answer,
                  answerTime: timeLeft
                }
              };
            }
            return prev;
          });
        }
      }
    });
  }, [messages, phase, timeLeft]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'playing' && timeLeft === 0) {
      handleRoundEnd();
    }
  }, [phase, timeLeft]);

  const setRandomQuestion = () => {
    const randomQ = ARABIC_QUESTIONS[Math.floor(Math.random() * ARABIC_QUESTIONS.length)];
    const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);
    setQuestionData({
      q: randomQ.q,
      a: randomQ.a,
      options: shuffledOptions
    });
  };

  const startGame = () => {
    setPhase('joining');
  };

  const startFirstQuestion = () => {
    setPhase('playing');
    setCurrentQuestion(1);
    setTimeLeft(settings.timePerQuestion);
    setStreamerSecretAnswer('');
    setLockedStreamerAnswer('');
    setRandomQuestion();
    setPlayers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k].currentAnswer = undefined;
        next[k].answerTime = undefined;
        next[k].roundPoints = 0;
      });
      return next;
    });
  };

  const startNextQuestion = () => {
    if (currentQuestion >= settings.numQuestions) {
      setPhase('final_results');
      return;
    }
    setPhase('playing');
    setCurrentQuestion(prev => prev + 1);
    setTimeLeft(settings.timePerQuestion);
    setStreamerSecretAnswer('');
    setLockedStreamerAnswer('');
    setRandomQuestion();
    setPlayers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k].currentAnswer = undefined;
        next[k].answerTime = undefined;
        next[k].roundPoints = 0;
      });
      return next;
    });
  };

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (streamerSecretAnswer.trim() && timeLeft !== null && timeLeft > 0) {
      setLockedStreamerAnswer(streamerSecretAnswer.trim().toLowerCase());
      
      setPlayers(prev => {
        const streamerName = channelName || 'Streamer';
        const streamerId = streamerName.toLowerCase();
        const player = prev[streamerId] || { username: streamerName, score: 0 };
        
        if (!player.currentAnswer) {
          return {
            ...prev,
            [streamerId]: {
              ...player,
              currentAnswer: streamerSecretAnswer.trim(),
              answerTime: timeLeft
            }
          };
        }
        return prev;
      });
    }
  };

  const checkAnswer = (playerAnswer: string | undefined): boolean => {
    if (!playerAnswer || !questionData) return false;
    const ans = playerAnswer.toLowerCase().trim();
    const correctText = questionData.a.toLowerCase().trim();
    const correctIndex = (questionData.options.findIndex(o => o.toLowerCase().trim() === correctText) + 1).toString();
    
    // Stricter matching: Exact text, includes correct text (for sentences), or exact index number
    return ans === correctText || ans.includes(correctText) || ans === correctIndex;
  };

  const handleRoundEnd = () => {
    setPlayers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        const p = next[k];
        let points = 0;
        if (checkAnswer(p.currentAnswer)) {
          const timeTaken = settings.timePerQuestion - (p.answerTime || 0);
          // Highest is 86 points, drops by 3 points every second
          points = Math.max(0, 86 - (timeTaken * 3));
        }
        p.roundPoints = points;
        p.score += points;
      });
      return next;
    });
    setPhase('round_results');
  };

  const sortedPlayers = (Object.values(players) as Player[]).sort((a, b) => b.score - a.score);
  const activePlayers = Object.values(players) as Player[];

  const renderPhase = () => {
    if (phase === 'config') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto">
          <div className="bg-zinc-800/80 border border-zinc-700 p-8 rounded-2xl w-full">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Settings className="w-8 h-8 text-brand-cyan" />
              إعدادات اللعبة
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-4">عدد الأسئلة</label>
                <div className="grid grid-cols-5 gap-3">
                  {[5, 10, 15, 20, 25].map(num => (
                    <button
                      key={num}
                      onClick={() => setSettings({...settings, numQuestions: num})}
                      className={`py-3 rounded-xl font-bold transition-all border ${
                        settings.numQuestions === num 
                          ? 'bg-brand-cyan border-brand-pink text-brand-black shadow-[0_0_15px_rgba(0, 229, 255,0.4)]' 
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-4">الوقت لكل سؤال (ثانية)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[15, 20, 25, 30].map(sec => (
                    <button
                      key={sec}
                      onClick={() => setSettings({...settings, timePerQuestion: sec})}
                      className={`py-3 rounded-xl font-bold transition-all border ${
                        settings.timePerQuestion === sec 
                          ? 'bg-brand-cyan border-brand-pink text-brand-black shadow-[0_0_15px_rgba(0, 229, 255,0.4)]' 
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={startGame}
                className="w-full bg-brand-cyan hover:bg-brand-pink text-brand-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-8 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]"
              >
                <Play className="w-5 h-5" /> بدء اللعبة
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'joining') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full font-arabic" dir="rtl">
          <h2 className="text-4xl font-bold text-white mb-4">بانتظار اللاعبين</h2>
          <p className="text-xl text-zinc-400 mb-8">
            اكتب <span className="text-brand-pink font-mono bg-brand-indigo/10 px-3 py-1 rounded-lg border border-brand-indigo/20">!join</span> في الدردشة للدخول
          </p>
          
          <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl mb-8 min-h-[200px] max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-zinc-300">اللاعبون المنضمون</h3>
              <span className="bg-brand-pink/20 text-brand-cyan px-3 py-1 rounded-full text-sm font-bold border border-brand-cyan/30">
                المجموع {activePlayers.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {activePlayers.map((p, i) => (
                <div key={p.username} className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-zinc-500 text-sm">#{i + 1}</span>
                  <span className="text-zinc-200 font-medium">{p.username}</span>
                </div>
              ))}
              {activePlayers.length === 0 && (
                <div className="text-zinc-500 italic w-full text-center py-8">لم ينضم أي لاعب بعد...</div>
              )}
            </div>
          </div>

          <button 
            onClick={startFirstQuestion}
            disabled={activePlayers.length === 0}
            className="bg-brand-pink hover:bg-pink-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-brand-black font-bold py-4 px-12 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-[0_0_30px_rgba(0, 229, 255,0.2)]"
          >
            بدء الجولة 1 <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      );
    }

    if (phase === 'playing') {
      const renderStreamerPanel = (isPopout = false) => (
        <div className={`bg-brand-black/90  border-2 border-brand-cyan/50 rounded-xl p-4 shadow-2xl ${isPopout ? 'w-full h-full border-0' : 'w-80'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-brand-cyan flex items-center gap-2">
              {!isPopout && <GripHorizontal className="w-4 h-4" />} تحكم الستريمر السري
            </h3>
            <div className="flex gap-2">
              {!isPopout && (
                <button 
                  onClick={() => setIsPopoutOpen(true)} 
                  className="text-zinc-400 hover:text-brand-cyan transition-colors" 
                  title="فتح في نافذة جديدة"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => { setShowStreamerBox(false); setIsPopoutOpen(false); }} className="text-zinc-500 hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSecretSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">إجابتك (مخفية عن البث)</label>
              <div className="relative">
                <input
                  type="password"
                  value={streamerSecretAnswer}
                  onChange={e => setStreamerSecretAnswer(e.target.value)}
                  placeholder="اكتب إجابتك هنا..."
                  className="w-full bg-brand-black border border-brand-cyan/30 rounded-lg pr-10 pl-4 py-2 text-white text-sm focus:ring-2 focus:ring-brand-cyan outline-none"
                  onPointerDownCapture={e => e.stopPropagation()} // Prevent drag when typing
                />
                <EyeOff className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
              </div>
            </div>
            {lockedStreamerAnswer ? (
              <div className="text-xs text-brand-cyan text-center bg-brand-indigo/10 py-2 rounded-lg border border-brand-indigo/20">
                تم إرسال الإجابة!
              </div>
            ) : (
              <p className="text-xs text-zinc-500 leading-tight text-center">
                اضغط Enter لإرسال إجابتك.
              </p>
            )}
          </form>
        </div>
      );

      return (
        <div className="flex h-full w-full gap-6 relative font-arabic" dir="rtl">
          
          {/* Draggable Streamer Secret Box */}
          {showStreamerBox && !isPopoutOpen && (
            <motion.div
              drag
              dragMomentum={false}
              className="absolute z-50 top-4 right-4 cursor-move"
            >
              {renderStreamerPanel(false)}
            </motion.div>
          )}

          {/* Popout Window */}
          {showStreamerBox && isPopoutOpen && (
            <PopoutWindow onClose={() => setIsPopoutOpen(false)}>
              <div className="flex items-center justify-center h-screen bg-zinc-950 p-4" dir="rtl">
                {renderStreamerPanel(true)}
              </div>
            </PopoutWindow>
          )}

          {!showStreamerBox && (
            <button
              onClick={() => setShowStreamerBox(true)}
              className="absolute top-4 right-4 bg-brand-indigo/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-indigo/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors z-10"
            >
              <EyeOff className="w-4 h-4" /> إظهار الصندوق السري
            </button>
          )}

          {/* Main Question Area */}
          <div className="flex-1 flex flex-col relative">
            <div className="flex items-center justify-between mb-6">
              <div className="bg-zinc-800/80 border border-zinc-700 px-4 py-2 rounded-lg text-zinc-300 font-medium">
                سؤال {currentQuestion} / {settings.numQuestions}
              </div>
              <div className={`flex items-center gap-2 text-3xl font-bold font-mono px-6 py-3 rounded-xl border ${timeLeft !== null && timeLeft <= 5 ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-zinc-800/80 border-zinc-700 text-white'}`} dir="ltr">
                <Clock className="w-6 h-6" /> 00:{timeLeft?.toString().padStart(2, '0') || '00'}

              </div>
            </div>

            <div className="flex-1 bg-zinc-800/70 border border-zinc-700/50 rounded-2xl p-8 flex flex-col items-center justify-center relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12 leading-tight">
                {questionData?.q}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {questionData?.options.map((opt, i) => (
                  <div key={i} className="bg-brand-black/80 border border-brand-cyan/20 p-6 rounded-xl text-center text-2xl font-bold text-white flex items-center justify-start gap-4 shadow-lg hover:border-brand-cyan/50 transition-all">
                    <span className="bg-brand-pink/20 text-brand-pink w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border border-brand-cyan/30">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-right">{opt}</span>
                  </div>
                ))}
              </div>
              
              <p className="mt-8 text-zinc-400 text-lg">
                اكتب <span className="text-brand-pink font-bold">رقم الإجابة</span> في الدردشة للمشاركة!
              </p>
            </div>
          </div>

          {/* Live Leaderboard Sidebar */}
          <div className="w-80 flex flex-col gap-4">
            <div className="flex-1 bg-brand-black/70  border border-brand-cyan/20 rounded-xl p-4 flex flex-col min-h-0">
              <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-brand-cyan" /> لوحة الصدارة المباشرة
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {sortedPlayers.map((p, i) => (
                  <div key={p.username} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`font-bold text-sm ${i === 0 ? 'text-brand-cyan' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-brand-cyan/70' : 'text-zinc-500'}`}>
                        #{i + 1}
                      </span>
                      <span className="text-zinc-200 text-sm truncate">{p.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-brand-pink font-mono text-sm">{p.score}</span>
                      {p.currentAnswer ? (
                        <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'round_results') {
      const correctPlayers = activePlayers.filter(p => checkAnswer(p.currentAnswer));
      const fastestPlayer = [...correctPlayers].sort((a, b) => (b.answerTime || 0) - (a.answerTime || 0))[0];

      return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto font-arabic" dir="rtl">
          <h2 className="text-3xl font-bold text-white mb-2">نتائج الجولة {currentQuestion}</h2>
          {questionData && <p className="text-xl text-zinc-300 mb-6 text-center">"{questionData.q}"</p>}
          
          <div className="bg-brand-black/80 border border-brand-cyan/20 rounded-2xl p-6 w-full mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-zinc-400 mb-1">الإجابة الصحيحة</p>
              <p className="text-2xl font-bold text-brand-cyan">{questionData?.a}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-zinc-400 mb-1">الإجابات الصحيحة</p>
              <p className="text-2xl font-bold text-white">{correctPlayers.length} / {activePlayers.length}</p>
            </div>
            {fastestPlayer && (
              <div className="text-left">
                <p className="text-sm text-zinc-400 mb-1">الأسرع</p>
                <p className="text-xl font-bold text-brand-cyan flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {fastestPlayer.username} ({(settings.timePerQuestion - (fastestPlayer.answerTime || 0))} ثانية)
                </p>
              </div>
            )}
          </div>

          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex-1 min-h-0 flex flex-col mb-6">
            <div className="grid grid-cols-4 gap-4 p-4 bg-zinc-800/80 border-b border-zinc-800 text-sm font-medium text-zinc-400">
              <div>اللاعب</div>
              <div>الإجابة</div>
              <div>الوقت</div>
              <div className="text-left">النقاط</div>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {activePlayers.map((p, i) => {
                const isCorrect = checkAnswer(p.currentAnswer);
                const hasAnswered = !!p.currentAnswer;
                
                return (
                  <div key={p.username} className={`grid grid-cols-4 gap-4 p-3 rounded-lg items-center ${isCorrect ? 'bg-brand-indigo/10 border border-brand-indigo/20' : hasAnswered ? 'bg-white/5 border border-white/10' : 'bg-brand-black/20 border border-white/5'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">#{i + 1}</span>
                      <span className="text-zinc-200 font-medium truncate">{p.username}</span>
                    </div>
                    <div className="truncate">
                      {hasAnswered ? (
                        <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                          {isCorrect ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <XCircle className="w-4 h-4 inline mr-1" />}
                          {p.currentAnswer}
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic">تخطى</span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {hasAnswered ? `${settings.timePerQuestion - (p.answerTime || 0)} ثانية` : '-'}
                    </div>
                    <div className={`text-left font-bold ${p.roundPoints && p.roundPoints > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      +{p.roundPoints || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={startNextQuestion}
            className="bg-brand-pink hover:bg-brand-pink text-brand-black font-bold py-4 px-12 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg w-full max-w-md shadow-[0_0_20px_rgba(0, 229, 255,0.2)]"
          >
            {currentQuestion >= settings.numQuestions ? 'إنهاء اللعبة' : 'السؤال التالي'} <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      );
    }

    if (phase === 'final_results') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto font-arabic" dir="rtl">
          <Trophy className="w-20 h-20 text-brand-cyan mb-6" />
          <h2 className="text-5xl font-black text-white mb-2 tracking-tight">لوحة الصدارة النهائية</h2>
          <p className="text-xl text-zinc-400 mb-12">انتهت اللعبة! إليكم النتائج النهائية.</p>
          
          <div className="w-full max-w-2xl space-y-3 mb-12">
            {sortedPlayers.map((p, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={p.username} 
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  i === 0 ? 'bg-brand-cyan/20 border-brand-cyan/50' :
                  i === 1 ? 'bg-zinc-300/20 border-zinc-300/50' :
                  i === 2 ? 'bg-cyan-600/20 border-cyan-600/50' :
                  'bg-brand-black/70 border-brand-cyan/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    i === 0 ? 'bg-brand-cyan text-brand-black' :
                    i === 1 ? 'bg-zinc-300 text-zinc-900' :
                    i === 2 ? 'bg-cyan-600 text-amber-950' :
                    'bg-brand-black text-brand-cyan/50 border border-brand-cyan/20'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xl font-bold ${
                    i === 0 ? 'text-brand-cyan' :
                    i === 1 ? 'text-zinc-300' :
                    i === 2 ? 'text-cyan-500' :
                    'text-zinc-200'
                  }`}>{p.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono text-white">{p.score}</span>
                  <span className="text-sm text-zinc-400 uppercase tracking-wider">نقطة</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setPhase('config')}
              className="bg-brand-black/70 hover:bg-brand-black/80 text-white font-bold py-3 px-8 rounded-xl transition-colors border border-brand-cyan/20 hover:border-brand-cyan/40"
            >
              اللعب مرة أخرى
            </button>
            <button 
              onClick={onLeave}
              className="bg-brand-pink hover:bg-brand-pink text-brand-black font-bold py-3 px-8 rounded-xl transition-colors shadow-[0_0_20px_rgba(0, 229, 255,0.2)]"
            >
              العودة للألعاب
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex gap-8 h-full bg-transparent w-full max-w-[1600px] mx-auto">
      {/* Main Trivia Area */}
      <div className="flex-1 bg-brand-black/80  rounded-[40px] border border-brand-cyan/20 p-8 flex flex-col relative overflow-hidden shadow-2xl font-arabic" dir="rtl">
        <button onClick={() => setShowChat(!showChat)} className="absolute bottom-6 left-6 text-brand-cyan/70 hover:text-brand-cyan flex items-center gap-2 transition-colors z-[90] bg-brand-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-cyan/20 hover:border-brand-cyan/40 shadow-xl">
            {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            {showChat ? 'إخفاء الشات' : 'إظهار الشات'}
          </button>

        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent" />
        <button 
          onClick={onLeave} 
          className="absolute top-6 right-6 text-brand-cyan/70 hover:text-brand-cyan flex items-center gap-2 transition-colors z-50 bg-brand-cyan/5 px-4 py-2 rounded-xl border border-brand-cyan/20 hover:border-brand-cyan/40"
        >
          <ArrowRight className="w-5 h-5" /> العودة للردهة
        </button>
        
        <div className="h-full w-full pt-12 flex flex-col relative z-10">
          {renderPhase()}
        </div>
      </div>

      {/* Twitch Chat Sidebar */}
      {showChat && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300">
          <div className="flex-1 min-h-0 bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl">
            <TwitchChat 
              channelName={channelName}
              messages={messages}
              isConnected={isConnected}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
};

