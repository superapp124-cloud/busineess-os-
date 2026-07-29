import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
 ArrowLeft, 
 Smartphone, 
 Monitor, 
 Download as DownloadIcon,
 CheckCircle2,
 MessageCircle,
 Heart,
 Shield,
 Zap
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import logo from '@/assets/chatr-logo.png';

export default function Download() {
 const navigate = useNavigate();
 const appUrl = window.location.origin;

 const features = [
 { icon: MessageCircle, title: 'Instant Messaging', description: 'Chat with anyone, anywhere' },
 { icon: Heart, title: 'Healthcare Platform', description: 'Complete digital health services' },
 { icon: Shield, title: 'Health Passport', description: 'Your medical records in one place' },
 { icon: Zap, title: 'AI Assistant', description: '24/7 health guidance' }
 ];

 const handleDownloadAndroid = () => {
 // In production, this would link to Google Play Store
 window.open('https://play.google.com/store', '_blank');
 };

 const handleDownloadIOS = () => {
 // In production, this would link to Apple App Store
 window.open('https://www.apple.com/app-store/', '_blank');
 };

 const handleOpenWeb = () => {
 navigate('/auth');
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
 {/* Header */}
 <div className="p-4 backdrop-blur-glass bg-gradient-glass border-b border-glass-border sticky top-0 z-10">
 <div className="max-w-6xl mx-auto flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => navigate('/')}
 className="rounded-full"
 >
 <ArrowLeft className="h-5 w-5" />
 </Button>
 <img src={logo} alt="chatr+ Logo" className="h-8 object-contain" />
 </div>
 <Button onClick={handleOpenWeb} variant="outline">
 Open Web App
 </Button>
 </div>
 </div>

 <div className="max-w-6xl mx-auto p-6 space-y-8">
 {/* Hero Section */}
 <div className="text-center space-y-4 py-8">
 <h1 className="text-display md:text-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
 Download Chatr+
 </h1>
 <p className="text-workspace text-muted-foreground max-w-2xl mx-auto">
 India's next-gen all-in-one messaging & healthcare platform
 </p>
 </div>

      {/* Download Options Grid */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 max-w-6xl mx-auto">

        {/* CHATR Desktop (RECOMMENDED) */}
        <Card className="bg-slate-900/90 border-2 border-cyan-500/80 shadow-xl shadow-cyan-500/10 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
            Recommended
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <Monitor className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-workspace font-bold text-white">CHATR Desktop</h2>
                <p className="text-xs text-cyan-400 font-medium">Windows • macOS • Linux</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              The sovereign AI workspace. Runs local AI models, private offline memory, voice AI, and business automation 100% on your device.
            </p>

            <div className="space-y-2.5">
              <Button 
                onClick={() => window.open('/download/chatr-desktop-setup.exe', '_blank')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20"
                size="lg"
              >
                <DownloadIcon className="mr-2 h-5 w-5" />
                Download for Windows (.exe)
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => window.open('/download/chatr-desktop.dmg', '_blank')}
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  macOS (.dmg)
                </Button>
                <Button 
                  onClick={() => window.open('/download/chatr-desktop.AppImage', '_blank')}
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  Linux (.AppImage)
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <p className="text-slate-400 font-medium">Superpowers included:</p>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Zero-Cloud Local AI Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Private Offline Document RAG</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Voice AI & Autonomous Coworkers</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Apps */}
        <Card className="bg-card/50 backdrop-blur-glass border-glass-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-workspace font-bold">Mobile App</h2>
                <p className="text-secondary text-muted-foreground">For Android & iOS</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleDownloadAndroid}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <DownloadIcon className="mr-2 h-5 w-5" />
                Download for Android
              </Button>
              
              <Button 
                onClick={handleDownloadIOS}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <DownloadIcon className="mr-2 h-5 w-5" />
                Download for iPhone
              </Button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-glass-border">
              <p className="text-secondary text-muted-foreground">Scan to download on mobile</p>
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG value={appUrl} size={130} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Web App */}
 <Card className="bg-card/50 backdrop-blur-glass border-glass-border">
 <CardContent className="p-6 space-y-6">
 <div className="flex items-center gap-3">
 <div className="p-3 rounded-full bg-accent/10">
 <Monitor className="h-6 w-6 text-accent" />
 </div>
 <div>
 <h2 className="text-workspace font-bold">Web App</h2>
 <p className="text-secondary text-muted-foreground">Use in your browser</p>
 </div>
 </div>

 <div className="space-y-4">
 <p className="text-muted-foreground">
 Access Chatr+ directly from your browser. Works on desktop and mobile.
 </p>

 <Button 
 onClick={handleOpenWeb}
 className="w-full"
 size="lg"
 variant="default"
 >
 Open Web App
 </Button>

 <div className="space-y-2 pt-4 border-t border-glass-border">
 <p className="text-secondary font-medium">Features include:</p>
 <ul className="space-y-2">
 {['Real-time messaging', 'Voice & video calls', 'Health passport access', 'AI health assistant'].map((feature) => (
 <li key={feature} className="flex items-center gap-2 text-secondary text-muted-foreground">
 <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
 <span>{feature}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Features Grid */}
 <div className="max-w-4xl mx-auto">
 <h2 className="text-page font-bold text-center mb-6">Why Choose Chatr+?</h2>
 <div className="grid md:grid-cols-2 gap-4">
 {features.map((feature) => (
 <Card key={feature.title} className="bg-card/50 backdrop-blur-glass border-glass-border">
 <CardContent className="p-6 flex items-start gap-4">
 <div className="p-3 rounded-full bg-primary/10">
 <feature.icon className="h-5 w-5 text-primary" />
 </div>
 <div>
 <h3 className="font-semibold mb-1">{feature.title}</h3>
 <p className="text-secondary text-muted-foreground">{feature.description}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>

 {/* System Requirements */}
 <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-glass border-glass-border">
 <CardContent className="p-6">
 <h3 className="font-semibold mb-4">System Requirements</h3>
 <div className="grid md:grid-cols-3 gap-6 text-secondary">
 <div>
 <p className="font-medium mb-2">Android</p>
 <p className="text-muted-foreground">Android 7.0 or higher</p>
 </div>
 <div>
 <p className="font-medium mb-2">iOS</p>
 <p className="text-muted-foreground">iOS 13.0 or higher</p>
 </div>
 <div>
 <p className="font-medium mb-2">Web</p>
 <p className="text-muted-foreground">Modern browsers (Chrome, Firefox, Safari, Edge)</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* CTA */}
 <div className="text-center space-y-4 py-8">
 <h2 className="text-page font-bold">Ready to get started?</h2>
 <div className="flex flex-wrap gap-3 justify-center">
 <Button onClick={handleOpenWeb} size="lg">
 Start Using Chatr+
 </Button>
 <Button onClick={() => navigate('/')} variant="outline" size="lg">
 Learn More
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
}
