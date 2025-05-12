import { iranYekanX, iranYekanXFaNum } from './fonts';

export default function FontDemo() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Font Demonstration</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Default Font (Geist Sans)</h3>
          <p>This text uses the default Geist Sans font.</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">IRANYekanX Font</h3>
          <p className={iranYekanX.className}>
            این متن با فونت ایران یکان ایکس نمایش داده می‌شود.
          </p>
          <p className="font-iran-yekan">
            این متن با کلاس tailwind فونت ایران یکان نمایش داده می‌شود.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">IRANYekanXFaNum Font</h3>
          <p className={iranYekanXFaNum.className}>
            این متن با اعداد فارسی ۱۲۳۴۵۶۷۸۹۰ نمایش داده می‌شود.
          </p>
          <p className="font-iran-yekan-fa-num">
            این متن با کلاس tailwind و اعداد فارسی ۱۲۳۴۵۶۷۸۹۰ نمایش داده می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
} 