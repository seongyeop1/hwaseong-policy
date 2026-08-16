'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const FAQS = [
  {
    q: '어떤 정보를 입력해야 하나요?',
    a: '나이, 거주 지역(읍면동), 가구 유형(1인·부부·한부모 등), 생애주기(청년·신혼부부·임신·출산 등)를 선택하시면 됩니다. 모든 항목을 입력할수록 더 정확한 결과를 받으실 수 있습니다.',
  },
  {
    q: '개인정보는 어떻게 처리되나요?',
    a: '입력하신 정보는 브라우저 안에서만 처리되며, 별도 서버에 저장되거나 전송되지 않습니다. 페이지를 새로 고침하면 입력 내용이 초기화됩니다.',
  },
  {
    q: '분석 결과가 실제 수급 자격을 보장하나요?',
    a: '아닙니다. 본 서비스는 입력하신 정보를 바탕으로 정책 해당 가능성을 안내하는 참고 도구입니다. 실제 수급 자격 및 신청 여부는 화성시 담당 부서에 문의하거나 복지로(bokjiro.go.kr)에서 확인하시기 바랍니다.',
  },
  {
    q: '정책 정보는 얼마나 자주 업데이트되나요?',
    a: "화성시에서 신규 정책이 공고되거나 기존 정책의 조건·금액이 변경되면 최대한 빠르게 반영합니다. 화면 상단의 '기준일'을 확인하시면 데이터 기준 시점을 알 수 있습니다.",
  },
  {
    q: 'What-if 시뮬레이터는 무엇인가요?',
    a: "'6개월 뒤 상황이 되면 어떤 정책이 추가될까?', '자녀가 한 명 더 생기면?' 같은 가상 시나리오를 미리 체험해 볼 수 있는 기능입니다. 미래 계획을 세울 때 유용하게 활용하세요.",
  },
  {
    q: '화성시 외 지역도 이용할 수 있나요?',
    a: '현재는 화성시 정책만 수록되어 있습니다. 타 지역 거주자가 이용하시면 화성시 기준으로 분석되므로 실제 거주 지역과 다른 결과가 나올 수 있습니다.',
  },
  {
    q: '스마트폰에서도 이용할 수 있나요?',
    a: "네, 모바일 화면에 최적화되어 있습니다. 글씨가 작아 불편하시다면 화면 상단의 '큰 글씨' 버튼을 눌러 글씨 크기를 키워 이용하실 수 있습니다.",
  },
  {
    q: '이용 중 오류나 정책 오류를 발견했을 때는 어떻게 하나요?',
    a: '정책 내용 오류나 서비스 이용 중 문제가 발생한 경우 화성시 담당 부서 또는 서비스 운영팀으로 문의해 주시기 바랍니다. 빠르게 확인 후 수정하겠습니다.',
  },
];

const accordionSpring = { type: 'spring', bounce: 0, duration: 0.32 } as const;
const chevronSpring   = { type: 'spring', bounce: 0.2, duration: 0.3 } as const;
const tapSpring       = { type: 'spring', bounce: 0, duration: 0.2 } as const;

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`bg-white rounded-2xl overflow-hidden transition-shadow duration-150 ${
      open ? 'shadow-[0_4px_20px_rgba(0,0,0,0.09)]' : 'shadow-[0_1px_4px_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.06)]'
    }`}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.99 }}
        transition={tapSpring}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className={`text-sm font-semibold transition-colors duration-150 ${
          open ? 'text-sky-700 font-bold' : 'text-gray-700'
        }`}>
          {q}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={chevronSpring}
          className={`w-4 h-4 flex-shrink-0 transition-colors duration-150 ${
            open ? 'text-sky-600' : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={accordionSpring}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 pt-3 border-t border-black/[0.06]">
              <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="bg-[#E1EEF6] min-h-screen">

      {/* ── 네이비 헤더 ── */}
      <section className="py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-[0.6rem] font-bold tracking-[0.22em] text-sky-700/80 uppercase mb-3">서비스 안내</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 [letter-spacing:-0.03em]">자주 묻는 질문</h1>
          <p className="text-sm text-slate-600">화성맞춤 서비스 이용 중 궁금한 점을 확인하세요.</p>
        </div>
      </section>

      {/* ── 라이트 콘텐츠 시트 ── */}
      <div className="bg-white rounded-t-[2.5rem] shadow-[0_-16px_60px_rgba(14,116,144,0.08)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="space-y-2.5">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>

          {/* 추가 문의 CTA */}
          <div className="mt-10 bg-sky-50 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6 text-center">
            <p className="text-sm font-semibold text-sky-900 mb-1">찾는 답변이 없으신가요?</p>
            <p className="text-sm text-sky-700 mb-4">맞춤 분석 기능을 바로 사용해 보세요.</p>
            <motion.div whileTap={{ scale: 0.96 }} transition={tapSpring} className="inline-block">
              <Link
                href="/analysis"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                맞춤 정책 분석하기 →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
