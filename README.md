# מערכת ניהול עסק מקיפה

מערכת ניהול עסק מתקדמת עם דף נחיתה, מערכת הזמנת תורים ופאנל ניהול למנהלים.

## תכונות עיקריות

### 🏠 דף נחיתה מרשים
- עיצוב מודרני ומקצועי
- תמיכה מלאה בעברית (RTL)
- רספונסיבי לכל המכשירים
- אנימציות חלקות
- SEO מותאם

### 📅 מערכת הזמנת תורים
- בחירת שירות מרשימת השירותים הזמינים
- בדיקת זמינות בזמן אמת
- אימות נתונים מתקדם
- הודעות אישור ושגיאות

### 👨‍💼 פאנל ניהול מתקדם
- ניהול תורים: אישור, ביטול, צפייה בפרטים
- עריכת תוכן האתר בזמן אמת
- ניהול שירותים: הוספה, עריכה, מחיקה
- רשימת לקוחות ומעקב אחר התנהגות

### 🔐 מערכת אימות בטוחה
- הצפנת סיסמאות
- JWT Tokens
- הגנה מפני התקפות
- הפרדת הרשאות משתמש/מנהל

## התקנה והפעלה

### דרישות מערכת
- Node.js 14.0 ומעלה
- NPM או Yarn

### התקנה
```bash
# הורדת הפרויקט
git clone [repository-url]
cd business-landing-system

# התקנת חבילות
npm install

# הפעלת השרת
npm start
```

### שימוש במצב פיתוח
```bash
npm run dev
```

## גישה למערכת

### אתר הלקוחות
```
http://localhost:3000
```

### פאנל ניהול
```
http://localhost:3000/admin
```

**פרטי התחברות ברירת מחדל:**
- שם משתמש: `admin`
- סיסמה: `admin123`

⚠️ **חשוב:** שנה את פרטי ההתחברות לאחר ההתקנה הראשונה!

## מבנה הפרויקט

```
├── server.js              # שרת Node.js ראשי
├── index.html            # דף הנחיתה הראשי
├── admin.html            # פאנל ניהול
├── script.js             # לוגיקת הלקוח
├── admin.js              # לוגיקת פאנל הניהול
├── styles.css            # עיצוב CSS
├── package.json          # הגדרות הפרויקט
└── business.db           # מסד נתונים SQLite
```

## תכונות מפורטות

### 📋 ניהול תורים
- **צפייה בתורים**: רשימה מלאה של כל התורים
- **סינון**: לפי סטטוס, תאריך, שירות
- **אישור תורים**: אישור אוטומטי או ידני
- **ביטול תורים**: עם אפשרות הוספת סיבה
- **פרטי לקוח**: מידע מלא על הלקוח

### ⚙️ הגדרות אתר
- **פרטי עסק**: שם, תיאור, לוגו
- **דף הבית**: כותרות, תמונות, טקסטים
- **פרטי יצירת קשר**: טלפון, אימייל, כתובת
- **שעות פעילות**: הגדרת זמני פעילות

### 🛍️ ניהול שירותים
- **הוספת שירותים**: שם, תיאור, מחיר, משך זמן
- **עריכת שירותים**: עדכון פרטים קיימים
- **הפעלה/השבתה**: הסתרת שירותים זמנית
- **מחיקת שירותים**: הסרה מהמערכת

### 👥 ניהול לקוחות
- **רשימת לקוחות**: מידע מרוכז על כל הלקוחות
- **היסטוריית תורים**: מעקב אחר תורים קודמים
- **פרטי יצירת קשר**: טלפון ואימייל ניתנים ללחיצה
- **סטטיסטיקות**: מספר תורים, תור אחרון

## API מובנה

המערכת כוללת API מלא לכל הפעולות:

### נתיבי לקוחות
- `GET /api/settings` - קבלת הגדרות העסק
- `GET /api/services` - רשימת שירותים
- `POST /api/appointments` - יצירת תור חדש
- `GET /api/available-slots` - זמינות שעות

### נתיבי ניהול (דורשים אימות)
- `GET /api/admin/appointments` - רשימת תורים
- `PUT /api/admin/appointments/:id` - עדכון סטטוס תור
- `PUT /api/settings` - עדכון הגדרות
- `POST /api/login` - התחברות

## אבטחה

### הגנות מובנות
- **Rate Limiting**: הגבלת בקשות לכל IP
- **JWT Authentication**: אימות מאובטח
- **SQL Injection Protection**: שאילתות בטוחות
- **CORS Configuration**: הגדרות CORS מתאימות

### המלצות אבטחה
1. **שינוי JWT Secret**: עדכן את `JWT_SECRET` בסביבת הייצור
2. **סיסמה חזקה**: שנה את סיסמת האדמין
3. **HTTPS**: השתמש ב-SSL בסביבת הייצור
4. **גיבויים**: בצע גיבויים קבועים למסד הנתונים

## התאמה אישית

### עיצוב
ערוך את קובץ `styles.css` לשינוי הצבעים והגופנים:

```css
:root {
    --primary-color: #007bff;    /* צבע ראשי */
    --secondary-color: #28a745;  /* צבע משני */
    --background-color: #f8f9fa; /* רקע */
}
```

### תוכן
כל התוכן ניתן לעריכה דרך פאנל הניהול או ישירות במסד הנתונים.

### שפה
המערכת תומכת בעברית כברירת מחדל, אך ניתן להוסיף תמיכה בשפות נוספות.

## פתרון בעיות נפוצות

### השרת לא עולה
```bash
# בדוק שהפורט 3000 פנוי
netstat -tulpn | grep :3000

# בדוק לוגים של השרת
node server.js
```

### מסד הנתונים לא נטען
```bash
# מחק את מסד הנתונים הקיים ותן לו להיווצר מחדש
rm business.db
node server.js
```

### בעיות ברשת
- ודא שהפיירוול מאפשר תעבורה בפורט 3000
- בדוק שאין פרוקסי החוסם בקשות

## תמיכה ופיתוח

### מצבי הפעלה
- **Development**: `npm run dev` (עם nodemon לרענון אוטומטי)
- **Production**: `npm start` (מצב רגיל)

### לוגים
השרת מדפיס לוגים מפורטים לקונסול הכוללים:
- חיבורים למסד הנתונים
- בקשות API
- שגיאות ואזהרות

### גיבוי ושחזור
```bash
# גיבוי מסד הנתונים
cp business.db backup_$(date +%Y%m%d_%H%M%S).db

# שחזור מגיבוי
cp backup_YYYYMMDD_HHMMSS.db business.db
```

## רישיון

MIT License - ראה קובץ LICENSE לפרטים נוספים.

---

**נבנה עם ❤️ למנהלי עסקים מודרניים**

לשאלות ותמיכה נוספת, פנה אל מפתח המערכת.
