import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { locationService } from '@/services/locationService';

interface BootSequenceProps {
  onComplete: () => void;
}

// Simple translation dictionary
const TRANSLATIONS: Record<string, string[]> = {
  en: [
    "> CONNECTING TO AKASHIC RECORDS...",
    "> DECRYPTING SOUL CONTRACT...",
    "> BYPASSING EGO FIREWALL...",
    "> LINK ESTABLISHED."
  ],
  es: [ // Spanish
    "> CONECTANDO A REGISTROS AKÁSHICOS...",
    "> DESCIFRANDO CONTRATO DE ALMA...",
    "> EVADIENDO FIREWALL DEL EGO...",
    "> ENLACE ESTABLECIDO."
  ],
  fr: [ // French
    "> CONNEXION AUX DOSSIERS AKASHIQUES...",
    "> DÉCRYPTAGE DU CONTRAT D'ÂME...",
    "> CONTOURNEMENT DU PARE-FEU EGO...",
    "> LIEN ÉTABLI."
  ],
  de: [ // German
    "> VERBINDUNG ZU AKASHA-CHRONIK...",
    "> ENTSCHLÜSSELUNG SEELENVERTRAG...",
    "> UMGEHUNG EGO-FIREWALL...",
    "> VERBINDUNG HERGESTELLT."
  ],
  pt: [ // Portuguese
    "> CONECTANDO AOS REGISTROS AKÁSHICOS...",
    "> DECIFRANDO CONTRATO DE ALMA...",
    "> IGNORANDO FIREWALL DO EGO...",
    "> LINK ESTABELECIDO."
  ],
  ja: [ // Japanese
    "> アカシックレコードに接続中...",
    "> 魂の契約を解読中...",
    "> 自我のファイアウォールを回避中...",
    "> リンク確立。"
  ],
  zh: [ // Chinese
    "> 正在连接阿卡西记录...",
    "> 正在解密灵魂契约...",
    "> 正在绕过自我防火墙...",
    "> 链接已建立。"
  ],
  ru: [ // Russian
    "> ПОДКЛЮЧЕНИЕ К ХРОНИКАМ АКАШИ...",
    "> РАСШИФРОВКА КОНТРАКТА ДУШИ...",
    "> ОБХОД БРАНДМАУЭРА ЭГО...",
    "> СВЯЗЬ УСТАНОВЛЕНА."
  ],
  hi: [ // Hindi
    "> आकाशिक रिकॉर्ड से जुड़ रहा है...",
    "> आत्मा अनुबंध को डिक्रिप्ट कर रहा है...",
    "> अहंकार फ़ायरवॉल को बायपास कर रहा है...",
    "> लिंक स्थापित हुआ।"
  ],
  ar: [ // Arabic
    "> جارٍ الاتصال بسجلات الأكاشيك...",
    "> جارٍ فك تشفير عقد الروح...",
    "> جارٍ تجاوز جدار الحماية للأنا...",
    "> تم إنشاء الرابط."
  ],
  fa: [ // Persian
    "> در حال اتصال به سوابق آکاشیک...",
    "> رمزگشایی قرارداد روح...",
    "> دور زدن فایروال نفس...",
    "> لینک برقرار شد."
  ]
};

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [bootLines, setBootLines] = useState(TRANSLATIONS['en']);

  useEffect(() => {
    // Detect Language on Mount
    const lang = locationService.detectUserLanguage();
    const selectedLines = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    setBootLines(selectedLines);
  }, []);

  useEffect(() => {
    if (currentLineIndex >= bootLines.length) {
      setTimeout(onComplete, 800); // Wait a bit after last line
      return;
    }

    const timeout = setTimeout(() => {
      setLines(prev => [...prev, bootLines[currentLineIndex]]);
      setCurrentLineIndex(prev => prev + 1);
    }, 600); // Speed of typing

    return () => clearTimeout(timeout);
  }, [currentLineIndex, onComplete, bootLines]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8 font-mono text-[#00FF41]">
      <div className="w-full max-w-md space-y-2">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm md:text-base tracking-wider"
          >
            {line}
          </motion.div>
        ))}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-2 h-4 bg-[#00FF41] inline-block ml-1"
        />
      </div>
    </div>
  );
}

