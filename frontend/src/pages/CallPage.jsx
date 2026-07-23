import { VideoIcon } from 'lucide-react';
import Layout from '../components/Layout';

const CallPage = ({ onThemeChange, currentTheme }) => {
  return (
    <Layout showSidebar onThemeChange={onThemeChange} currentTheme={currentTheme}>
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <VideoIcon className="size-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Video Calls</h1>
          <p className="text-base-content/60 text-sm">
            Video calls are initiated directly from the chat window. Open a conversation
            and click the video camera icon to start a call with your language partner.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CallPage;