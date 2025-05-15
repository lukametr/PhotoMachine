// გადახდის იმიტაცია. მომავალში ჩასვით რეალური ტერმინალის ინტეგრაცია.
module.exports = async function processPayment() {
  // 2 წამში შემთხვევითი წარმატება ან წარუმატებლობა
  await new Promise(r => setTimeout(r, 2000));
  return Math.random() > 0.5 ? { success: true } : { success: false, error: 'Transaction declined' };
}; 