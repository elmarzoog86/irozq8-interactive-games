const dict = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
const texts = ["$٥٠٠", "hi ٩٠ 7TV", "answer is ١٢", "testing %١٠٠"];
texts.forEach(t => {
  const enText = t.replace(/[٠-٩]/g, d => dict[d]);
  console.log("Original:", t, "Converted:", enText);
  console.log("Match:", enText.match(/\b\d+\b/));
});