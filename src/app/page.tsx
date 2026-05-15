import { redirect } from 'next/navigation';

export default function RootPage() {
  // 사용자가 루트 경로로 접속하면 기본 청첩장인 'younghoo_yeeun'로 리다이렉트합니다.
  redirect('/younghoo_yeeun');
}
