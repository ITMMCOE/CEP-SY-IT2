
'use client';

import { Chatbot } from '@/components/chatbot';
import { MainLayout } from '@/components/main-layout';

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="h-[calc(100vh-80px)] w-full">
        <Chatbot />
      </div>
    </MainLayout>
  );
}
