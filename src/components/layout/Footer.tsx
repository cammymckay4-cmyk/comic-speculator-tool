import React from 'react'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API Docs', href: '/api' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
    social: [
      { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
      { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
      { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
      { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    ],
  }

  return (
    <footer className="bg-ink-black border-t-comic border-golden-age-yellow mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/trace.svg" 
                alt="ComicScout UK Logo" 
                className="h-[30px] w-auto mr-4"
                style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))' }}
              />
              <h3 className="font-super-squad text-3xl text-golden-age-yellow">
                COMICSCOUT UK
              </h3>
            </div>
            <p className="font-persona-aura text-parchment opacity-80 mb-4">
              Your ultimate comic collection manager. Track, value, and discover comics with the power of a superhero sidekick.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-parchment opacity-70">
                <Mail size={16} />
                <span className="font-persona-aura text-sm">support@comicscout.uk</span>
              </div>
              <div className="flex items-center space-x-2 text-parchment opacity-70">
                <Phone size={16} />
                <span className="font-persona-aura text-sm">+44 20 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-parchment opacity-70">
                <MapPin size={16} />
                <span className="font-persona-aura text-sm">London, UK</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-super-squad text-lg text-golden-age-yellow mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-persona-aura text-parchment opacity-70 hover:opacity-100 hover:text-golden-age-yellow transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-super-squad text-lg text-golden-age-yellow mb-4">
              SUPPORT
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-persona-aura text-parchment opacity-70 hover:opacity-100 hover:text-golden-age-yellow transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-super-squad text-lg text-golden-age-yellow mb-4">
              LEGAL
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-persona-aura text-parchment opacity-70 hover:opacity-100 hover:text-golden-age-yellow transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-golden-age-yellow opacity-20 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="font-persona-aura text-parchment opacity-60 text-sm">
            © {currentYear} ComicScoutUK. All rights reserved. POW! 💥
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            {footerLinks.social.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-golden-age-yellow bg-opacity-20 hover:bg-opacity-100 p-2 rounded-full transition-all duration-200 group"
                aria-label={social.label}
              >
                <social.icon 
                  size={20} 
                  className="text-golden-age-yellow group-hover:text-ink-black transition-colors duration-200" 
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
