const text = "7TV ٥٠٠";
const dict = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
const enText = text.replace(/[٠-٩]/g, d => dict[d]);
console.log("enText:", enText);
const match = enText.match(/\b(\d+)\b|(?:^|\s)(\d+)(?=\s|$)/);
console.log("match:", match ? (match[1] || match[2]) : null);