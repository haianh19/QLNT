import React from 'react';
import MusicPlayer from '../../components/MusicPlayer/MusicPlayer';
import './Settings.css';

export default function Settings() {
  const garageInfo = {
    name: 'GARA - KDEEXX',
    owner: 'Trần Đức Minh aka KDEEXX aka M.roy',
    address: '63th ParkWay Garden, Chicago',
    phone: '0916 916 117',
    email: 'tranducminhh1912@gmail.com',
  };

  const socialLinks = [
    { name: 'Facebook', icon: 'f', href: 'https://web.facebook.com/troc.minh.3388', className: 'facebook' },
    { name: 'Instagram', icon: '◎', href: 'https://www.instagram.com/zzkdzz_', className: 'instagram' },
    { name: 'YouTube', icon: '▶', href: 'https://www.youtube.com/channel/UCzyIG1_eMTQEIXfvic9TI-w', className: 'youtube' },
    { name: 'TikTok', icon: '♪', href: 'https://www.tiktok.com/@kdfrotf?is_from_webapp=1&sender_device=pc', className: 'tiktok' },
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-grid">
          {/* Garage Info Card */}
          <div className="settings-card garage-info-card">
          <div className="card-header">
            <div className="card-icon">🏢</div>
            <h2 className="card-title">Thông tin gara</h2>
          </div>

          <div className="info-grid">
            {/* Name */}
            <div className="info-item">
              <div className="info-label">
                <span className="info-icon">📛</span>
                Tên gara
              </div>
              <div className="info-value">{garageInfo.name}</div>
            </div>

            {/* Owner */}
            <div className="info-item">
              <div className="info-label">
                <span className="info-icon">👤</span>
                Chủ gara
              </div>
              <div className="info-value">{garageInfo.owner}</div>
            </div>

            {/* Address */}
            <div className="info-item">
              <div className="info-label">
                <span className="info-icon">📍</span>
                Địa chỉ
              </div>
              <div className="info-value">{garageInfo.address}</div>
            </div>

            {/* Phone */}
            <div className="info-item">
              <div className="info-label">
                <span className="info-icon">📞</span>
                Số điện thoại
              </div>
              <a href={`tel:${garageInfo.phone}`} className="info-value info-link">
                {garageInfo.phone}
              </a>
            </div>

            {/* Email */}
            <div className="info-item">
              <div className="info-label">
                <span className="info-icon">📧</span>
                Email
              </div>
              <a href={`mailto:${garageInfo.email}`} className="info-value info-link">
                {garageInfo.email}
              </a>
            </div>
          </div>
        </div>

        <div className="settings-card social-media-card">
          <div className="card-header">
            <div className="card-icon">🌐</div>
            <h2 className="card-title">Social Media</h2>
          </div>
          <div className="social-grid">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className={`social-item ${social.className}`}
              >
                <span className="social-logo">{social.icon}</span>
                <span className="social-name">{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Music Player Card */}
        <div className="settings-card music-player-card">
          <div className="card-header">
            <div className="card-icon">🎵</div>
            <h2 className="card-title">Garage Music</h2>
          </div>
          <MusicPlayer />
        </div>
        </div>
      </div>
    </div>
  );
}
