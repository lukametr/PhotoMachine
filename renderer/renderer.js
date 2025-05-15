const translations = {
  ka: {
    tap_to_start: 'დასაწყებად შეეხეთ ეკრანს',
    touch_to_start: 'დასაწყებად შეეხეთ ეკრანს',
    payment_instruction: 'გადახდის დასაწყებად დაადეთ ბარათი ან ტელეფონი',
    price: 'ფასი: 5₾',
    payment_success: 'გადახდა წარმატებულია',
    continue: 'გაგრძელება',
    payment_failure: 'გადახდა წარუმატებელია',
    try_again: 'სცადეთ თავიდან',
    cancel: 'გაუქმება',
    tap_to_start_title: 'დასაწყებად შეეხეთ ეკრანს',
  },
  en: {
    tap_to_start: 'Tap to Start',
    touch_to_start: 'Touch to Get Started',
    payment_instruction: 'Please complete your payment to begin',
    price: 'Price: 5₾',
    payment_success: 'Payment Success',
    continue: 'Continue',
    payment_failure: 'Payment Failure',
    try_again: 'Try Again',
    cancel: 'Cancel',
    tap_to_start_title: 'Tap to Start',
  }
};

let currentLang = 'ka';

function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });
  document.getElementById('ka-btn').classList.toggle('active', lang === 'ka');
  document.getElementById('en-btn').classList.toggle('active', lang === 'en');
}

window.addEventListener('DOMContentLoaded', () => {
  const mainScreen = document.getElementById('main-screen');
  const paymentScreen = document.getElementById('payment-screen');
  const successScreen = document.getElementById('success-screen');
  const failureScreen = document.getElementById('failure-screen');

  const startBtn = document.getElementById('start-btn');
  const continueBtn = document.getElementById('continue-btn');
  const retryBtn = document.getElementById('retry-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  // ენის სვიჩერი
  document.getElementById('ka-btn').addEventListener('click', () => setLanguage('ka'));
  document.getElementById('en-btn').addEventListener('click', () => setLanguage('en'));
  setLanguage('ka');

  const { ipcRenderer } = window.require ? window.require('electron') : {};

  function show(screen) {
    [mainScreen, paymentScreen, successScreen, failureScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
  }

  startBtn.addEventListener('click', async () => {
    show(paymentScreen);
    startBtn.disabled = true;
    // IPC-ით ვიძახებ გადახდას
    const result = await ipcRenderer.invoke('start-payment');
    startBtn.disabled = false;
    if (result.success) {
      show(successScreen);
    } else {
      show(failureScreen);
    }
  });

  continueBtn.addEventListener('click', async () => {
    // IPC-ით ვიძახებ dslrbooth-ის გაშვებას
    await ipcRenderer.invoke('start-dslrbooth');
    show(mainScreen);
  });

  retryBtn.addEventListener('click', async () => {
    show(paymentScreen);
    retryBtn.disabled = true;
    const result = await ipcRenderer.invoke('start-payment');
    retryBtn.disabled = false;
    if (result.success) {
      show(successScreen);
    } else {
      show(failureScreen);
    }
  });

  cancelBtn.addEventListener('click', () => {
    show(mainScreen);
  });

  // საწყისი ეკრანი
  show(mainScreen);

  // --- Admin PIN Modal ---
  let pinAttempts = 0;
  const adminZone = document.getElementById('admin-zone');
  const adminModal = document.getElementById('admin-modal');
  const adminPinInput = document.getElementById('admin-pin');
  const adminCancel = document.getElementById('admin-cancel');
  const adminSubmit = document.getElementById('admin-submit');
  const adminError = document.getElementById('admin-error');
  const ADMIN_PIN = '3223';

  // --- Admin Password Modal ---
  const adminPasswordModal = document.getElementById('admin-password-modal');
  const adminPasswordInput = document.getElementById('admin-password');
  const adminPasswordCancel = document.getElementById('admin-password-cancel');
  const adminPasswordSubmit = document.getElementById('admin-password-submit');
  const adminPasswordError = document.getElementById('admin-password-error');
  const ADMIN_PASSWORD = 'Order66';

  adminZone.addEventListener('click', () => {
    adminModal.classList.remove('hidden');
    adminPinInput.value = '';
    adminError.innerText = '';
    setTimeout(() => adminPinInput.focus(), 100);
  });
  adminCancel.addEventListener('click', () => {
    adminModal.classList.add('hidden');
    pinAttempts = 0;
  });
  adminSubmit.addEventListener('click', tryAdminPin);
  adminPinInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') tryAdminPin();
  });
  function tryAdminPin() {
    if (adminPinInput.value === ADMIN_PIN) {
      window.close();
    } else {
      pinAttempts++;
      if (pinAttempts >= 3) {
        adminModal.classList.add('hidden');
        showAdminPasswordModal();
        pinAttempts = 0;
        return;
      }
      adminError.innerText = 'პინი არასწორია!';
      adminPinInput.value = '';
      adminPinInput.focus();
    }
  }

  function showAdminPasswordModal() {
    adminPasswordModal.classList.remove('hidden');
    adminPasswordInput.value = '';
    adminPasswordError.innerText = '';
    setTimeout(() => adminPasswordInput.focus(), 100);
  }
  adminPasswordCancel.addEventListener('click', () => {
    adminPasswordModal.classList.add('hidden');
  });
  adminPasswordSubmit.addEventListener('click', tryAdminPassword);
  adminPasswordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') tryAdminPassword();
  });
  function tryAdminPassword() {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
      window.close();
    } else {
      adminPasswordError.innerText = 'პაროლი არასწორია!';
      adminPasswordInput.value = '';
      adminPasswordInput.focus();
    }
  }
}); 