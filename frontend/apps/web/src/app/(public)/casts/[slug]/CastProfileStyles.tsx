export function CastProfileStyles() {
  return (
    <style>{`
      .cast-page {
        --cast-mobile-nav-height: calc(74px + env(safe-area-inset-bottom));
        --cast-mobile-cta-height: 76px;
        --cast-mobile-fixed-space: calc(var(--cast-mobile-nav-height) + var(--cast-mobile-cta-height) + 28px);
        --cast-hero-control-bg: transparent;
        --cast-hero-control-bg-strong: transparent;
        --cast-hero-control-border: transparent;
        --cast-hero-control-icon: #f7cf5c;
        --cast-hero-control-shadow: none;
        --cast-hero-control-icon-shadow: none;
        min-height: auto;
        color: var(--vy-text);
        font-family: var(--nl-font-sans);
        background: var(--vy-bg);
      }

      html.vy-light .cast-page {
        --cast-hero-control-bg: transparent;
        --cast-hero-control-bg-strong: transparent;
        --cast-hero-control-border: transparent;
        --cast-hero-control-icon: #d4a72f;
        --cast-hero-control-shadow: none;
        --cast-hero-control-icon-shadow: none;
      }

      .cast-mobile {
        min-height: auto;
        padding-bottom: 0;
        background: var(--vy-bg);
      }

      .nl-page-content:has(.cast-page) {
        --cast-mobile-nav-height: calc(74px + env(safe-area-inset-bottom));
        --cast-mobile-cta-height: 76px;
        --cast-mobile-fixed-space: calc(var(--cast-mobile-nav-height) + var(--cast-mobile-cta-height) + 28px);
        padding-bottom: 0 !important;
        scroll-padding-bottom: 0 !important;
      }

      @media (max-width: 767px) {
        .cast-mobile {
          padding-bottom: var(--cast-mobile-fixed-space);
        }

        .nl-page-content:has(.cast-page) {
          padding-bottom: 0 !important;
          scroll-padding-bottom: var(--cast-mobile-fixed-space) !important;
        }

        .nl-page-content:has(.cast-page) + .nl-site-footer {
          padding-bottom: calc(92px + env(safe-area-inset-bottom)) !important;
        }
      }

      .cast-mobile-hero {
        position: relative;
        min-height: 452px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 14px 18px 18px;
        background-size: cover !important;
        background-position: center 18% !important;
        overflow: hidden;
        touch-action: pan-y;
      }

      .cast-hero-placeholder {
        position: absolute;
        inset: 0;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #f0dda8;
        text-align: center;
        pointer-events: none;
      }

      .cast-hero-placeholder span {
        font-size: 13px;
        line-height: 1.3;
        font-weight: 900;
      }

      .cast-mobile-topbar,
      .cast-title-row,
      .cast-badge-row,
      .cast-booking-cta,
      .cast-hero-store,
      .cast-section-heading,
      .cast-venue-meta,
      .cast-venue-action,
      .cast-venue-status,
      .cast-desktop-stat-row,
      .cast-desktop-booking-actions {
        display: flex;
        align-items: center;
      }

      .cast-mobile-topbar {
        justify-content: space-between;
        position: relative;
        z-index: 3;
        min-height: 42px;
      }

      .cast-icon-link {
        width: 38px;
        height: 38px;
        min-width: 38px;
        min-height: 38px;
        border: 0;
        border-radius: 999px;
        background: var(--cast-hero-control-bg);
        color: var(--cast-hero-control-icon);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        padding: 0;
        box-shadow: var(--cast-hero-control-shadow);
      }

      .cast-back-link {
        border: 1px solid rgba(247, 207, 92, .62);
        border-radius: 12px;
        background: rgba(8, 8, 10, .28);
        color: #f7cf5c;
        backdrop-filter: blur(8px);
      }

      html.vy-light .cast-back-link {
        border-color: rgba(151, 112, 37, .42);
        background: rgba(255, 248, 230, .76);
        color: #9c7125;
      }

      .cast-favorite-action {
        cursor: pointer;
        transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
      }

      .cast-favorite-action.is-active {
        background: rgba(255,61,113,.16);
        border-color: rgba(255,61,113,.54);
        color: #ff3d71;
      }

      .cast-favorite-action svg {
        pointer-events: none;
      }

      .cast-icon-link svg,
      .cast-hero-media-nav button svg,
      .cast-play svg {
        filter: var(--cast-hero-control-icon-shadow);
      }

      .cast-hero-media-nav {
        position: absolute;
        inset: 0;
        z-index: 3;
        pointer-events: none;
      }

      .cast-hero-media-nav button {
        position: absolute;
        top: 47%;
        width: 38px;
        height: 38px;
        border: 0;
        border-radius: 999px;
        background: var(--cast-hero-control-bg);
        color: var(--cast-hero-control-icon);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        pointer-events: auto;
        transform: translateY(-50%);
        transition: none;
        animation: none;
        will-change: auto;
        box-shadow: var(--cast-hero-control-shadow);
      }

      .cast-hero-media-nav button:active,
      .cast-hero-media-nav button:where(:hover, :focus-visible) {
        transform: translateY(-50%) !important;
      }

      .cast-hero-media-nav .previous {
        left: 14px;
      }

      .cast-hero-media-nav .next {
        right: 14px;
      }

      .cast-play {
        position: absolute;
        left: 50%;
        top: 46%;
        transform: translate(-50%, -50%);
        z-index: 2;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--cast-hero-control-bg-strong);
        color: var(--cast-hero-control-icon);
        box-shadow: var(--cast-hero-control-shadow);
        border: 0;
        cursor: pointer;
      }

      .cast-hero-copy {
        position: relative;
        z-index: 2;
      }

      .cast-badge-row {
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }

      .cast-rank-badge,
      .cast-live-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 999px;
        white-space: nowrap;
      }

      .cast-rank-badge {
        background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a);
        color: var(--vy-on-gold);
        font-size: 10px;
        font-weight: 800;
        padding: 6px 11px 6px 9px;
        box-shadow: 0 6px 16px -7px rgba(168,124,60,.8);
      }

      .cast-live-badge {
        background: rgba(12,12,15,.45);
        border: 1px solid rgba(212,178,106,.4);
        color: #f0e6d2;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 1.4px;
        text-transform: uppercase;
        padding: 5px 11px;
        backdrop-filter: blur(4px);
      }

      .cast-live-badge span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #e0729e;
        box-shadow: 0 0 8px #e0729e;
      }

      .cast-title-row {
        align-items: flex-end;
        gap: 11px;
        flex-wrap: wrap;
      }

      .cast-title-row h1 {
        margin: 0;
        color: #fff;
        font-size: 32px;
        line-height: .95;
        font-weight: 750;
        text-shadow: 0 1px 14px rgba(0,0,0,.55);
      }

      .cast-title-row span {
        color: #e7e1d4;
        font-size: 13px;
        padding-bottom: 3px;
      }

      .cast-hero-store {
        width: fit-content;
        gap: 6px;
        margin-top: 9px;
        color: #a7a294;
        text-decoration: none;
        font-size: 12.5px;
      }

      .cast-hero-store strong {
        color: #e3c27e;
        font-weight: 700;
      }

      .cast-section,
      .cast-related-section.mobile,
      .cast-gallery-grid-section {
        padding: 0 18px;
        margin-top: 20px;
      }

      .cast-section-heading {
        gap: 11px;
        margin-bottom: 10px;
      }

      .cast-gallery-grid-section {
        margin-top: 14px;
      }

      .cast-section-heading.compact {
        margin-top: 24px;
        margin-bottom: 13px;
      }

      .cast-section-heading h2 {
        margin: 0;
        flex: none;
        color: var(--vy-text);
        font-size: 21px;
        line-height: 1.04;
        font-weight: 650;
      }

      .cast-section-heading.compact h2 {
        font-size: 16px;
      }

      .cast-section-heading > span {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg,rgba(212,178,106,.45),transparent);
      }

      .cast-section-heading small {
        color: #9b958a;
        font-size: 10.5px;
        white-space: nowrap;
      }

      .cast-mobile-bio,
      .cast-desktop-copy {
        margin: 0;
        color: var(--vy-muted);
        font-size: 13px;
        line-height: 1.78;
      }

      .cast-mobile .cast-mobile-bio {
        color: #6f6657;
      }

      .cast-detail-list {
        display: grid;
        gap: 11px;
        margin-top: 15px;
      }

      .cast-detail-list.desktop {
        gap: 8px;
        margin-top: 14px;
      }

      .cast-info-row {
        display: flex;
        gap: 12px;
        min-width: 0;
      }

      .cast-info-row span {
        width: 76px;
        flex: none;
        color: var(--vy-muted);
        font-size: 11px;
        line-height: 1.45;
      }

      .cast-info-row strong {
        min-width: 0;
        color: #e7e1d4;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.45;
      }

      .cast-mobile .cast-info-row span {
        color: #8a806f;
      }

      .cast-mobile .cast-info-row strong {
        color: #3a3022;
        font-weight: 700;
      }

      .cast-schedule-grid {
        display: grid;
        gap: 0;
      }

      .cast-schedule-grid.desktop {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 24px;
      }

      .cast-schedule-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 13px 14px;
        border-bottom: 1px solid var(--vy-border);
      }

      .cast-schedule-grid.desktop .cast-schedule-row {
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 11px;
        background: var(--vy-surface-1);
      }

      .cast-schedule-row.is-highlight {
        border: 1px solid rgba(212,178,106,.4);
        border-radius: 13px;
        background: linear-gradient(135deg,rgba(212,178,106,.14),rgba(255,255,255,.03));
      }

      .cast-schedule-row > span {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .cast-schedule-row i {
        width: 7px;
        height: 7px;
        flex: none;
        border-radius: 50%;
        background: #e0729e;
        box-shadow: 0 0 8px #e0729e;
      }

      .cast-schedule-row strong {
        color: #e7e1d4;
        font-size: 13px;
        font-weight: 650;
        white-space: nowrap;
      }

      .cast-schedule-row small {
        color: var(--vy-muted);
        font-size: 11.5px;
        white-space: nowrap;
      }

      .cast-schedule-row b {
        color: #e7e1d4;
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
      }

      .cast-schedule-row.is-highlight b {
        color: #e3c27e;
      }

      .cast-schedule-row.is-muted strong,
      .cast-schedule-row.is-muted small,
      .cast-schedule-row.is-muted b {
        color: #6f6b62;
      }

      .cast-venue-card {
        display: flex;
        align-items: center;
        gap: 15px;
        min-height: 132px;
        color: var(--vy-text);
        text-decoration: none;
        background: linear-gradient(135deg,rgba(212,178,106,.07),rgba(255,255,255,.02));
        border: 1px solid var(--vy-border-gold-22);
        border-radius: 16px;
        padding: 14px;
      }

      .cast-venue-card.compact {
        gap: 13px;
        min-height: unset;
        background: var(--vy-surface-1);
        border-color: rgba(255,255,255,.06);
        border-radius: 14px;
        padding: 11px 13px;
      }

      .cast-venue-media {
        width: 104px;
        height: 104px;
        flex: none;
        border-radius: 13px;
        background-size: cover !important;
        background-position: center !important;
      }

      .cast-venue-card.compact .cast-venue-media {
        width: 54px;
        height: 54px;
        border-radius: 11px;
      }

      .cast-venue-copy {
        flex: 1;
        min-width: 0;
        display: grid;
        gap: 6px;
      }

      .cast-venue-head {
        display: block;
      }

      .cast-venue-head strong {
        display: block;
        color: var(--vy-text);
        font-size: 17px;
        font-weight: 650;
        line-height: 1.26;
      }

      .cast-venue-card.compact .cast-venue-head strong {
        font-size: 15px;
      }

      .cast-venue-actions {
        flex: 0 0 auto;
        min-width: 126px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 12px;
        margin-left: auto;
      }

      .cast-venue-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #7fd3a0;
        background: rgba(12,12,15,.4);
        border: 1px solid rgba(95,191,134,.4);
        border-radius: 9px;
        padding: 4px 9px;
        font-size: 10.5px;
        font-style: normal;
        font-weight: 650;
      }

      .cast-venue-copy small {
        color: var(--vy-muted);
        font-size: 12px;
      }

      .cast-venue-meta {
        gap: 0;
        color: var(--vy-muted);
        font-size: 12px;
      }

      .cast-venue-meta span {
        color: var(--vy-muted);
      }

      .cast-venue-action {
        flex: none;
        justify-content: center;
        gap: 4px;
        min-width: 126px;
        color: var(--vy-on-gold);
        background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a);
        border-radius: 11px;
        padding: 11px 20px;
        font-size: 13px;
        font-weight: 750;
      }

      .cast-venue-card.compact .cast-venue-actions {
        min-width: auto;
        margin-left: auto;
      }

      .cast-venue-card.compact .cast-venue-status {
        display: none;
      }

      .cast-venue-card.compact .cast-venue-action {
        color: var(--vy-gold);
        background: transparent;
        min-width: auto;
        padding: 0;
        font-size: 11.5px;
      }

      .cast-mobile-gallery-grid {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
        padding-bottom: 2px;
      }

      .cast-mobile-gallery-grid::-webkit-scrollbar {
        display: none;
      }

      .cast-gallery-tile {
        position: relative;
        flex: 0 0 94px;
        height: 70px;
        border: 0;
        border-radius: 11px;
        overflow: hidden;
        background-size: cover !important;
        background-position: center !important;
        padding: 0;
        cursor: pointer;
      }

      .cast-gallery-tile.is-placeholder,
      .cast-thumb.is-placeholder,
      .cast-lightbox-thumb.is-placeholder {
        color: #f0dda8;
        background: linear-gradient(135deg,#19191d,#2a2418) !important;
      }

      .cast-media-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #f0dda8;
        background: radial-gradient(circle at 28% 22%, rgba(212,178,106,.18), transparent 30%);
        text-align: center;
        pointer-events: none;
      }

      .cast-media-placeholder strong {
        font-size: 13px;
        line-height: 1.25;
        font-weight: 900;
      }

      .cast-media-placeholder.compact {
        gap: 0;
      }

      .cast-video-overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #fff;
        background: rgba(0,0,0,.22);
      }

      .cast-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .cast-chip {
        border-radius: 999px;
        padding: 7px 10px;
        font-size: 11.5px;
        font-weight: 750;
        line-height: 1;
      }

      .cast-chip.language,
      .cast-chip.tag {
        background: var(--vy-surface-2);
        color: var(--vy-muted);
        border: 1px solid var(--vy-border);
      }

      .cast-related-section.mobile .cast-related-list {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        scrollbar-width: none;
        padding-bottom: 4px;
      }

      .cast-related-section.mobile .cast-related-list::-webkit-scrollbar {
        display: none;
      }

      .cast-related-card {
        color: var(--vy-text);
        text-decoration: none;
      }

      .cast-related-section.mobile .cast-related-card {
        flex: 0 0 132px;
      }

      .cast-related-media {
        display: block;
        width: 100%;
        background-size: cover !important;
        background-position: center !important;
      }

      .cast-related-section.mobile .cast-related-media {
        height: 158px;
        border-radius: 14px;
        box-shadow: inset 0 -80px 60px -55px rgba(0,0,0,.85);
      }

      .cast-related-copy {
        display: grid;
        gap: 2px;
        padding-top: 8px;
      }

      .cast-related-copy strong {
        color: #fff;
        font-size: 14px;
        font-weight: 650;
      }

      .cast-related-section.mobile .cast-related-copy strong {
        color: #3a3022;
      }

      .cast-related-copy small,
      .cast-related-copy em {
        color: var(--vy-muted);
        font-size: 10.5px;
        font-style: normal;
      }

      .cast-related-section.mobile .cast-related-copy small,
      .cast-related-section.mobile .cast-related-copy em {
        color: #746a5a;
      }

      .cast-booking-cta.mobile {
        --cast-mobile-nav-height: calc(74px + env(safe-area-inset-bottom));
        --cast-mobile-cta-height: 76px;
        position: fixed !important;
        z-index: 70;
        left: 0 !important;
        right: 0 !important;
        top: auto !important;
        bottom: var(--cast-mobile-nav-height) !important;
        display: flex;
        align-items: center;
        gap: 11px;
        height: var(--cast-mobile-cta-height);
        min-height: var(--cast-mobile-cta-height);
        margin: 0 !important;
        padding: 10px 14px;
        background: color-mix(in srgb, var(--vy-surface) 90%, var(--vy-bg) 10%);
        border-top: 1px solid var(--vy-border-gold-32);
        box-sizing: border-box;
        box-shadow: var(--vy-shadow);
        backdrop-filter: blur(12px);
        transform: translateZ(0);
        pointer-events: auto;
      }

      .cast-booking-button {
        flex: 1;
        min-height: 50px;
        border-radius: 13px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--vy-gold-grad);
        color: var(--vy-on-gold);
        text-decoration: none;
        border: 0;
        text-align: center;
      }

      .cast-booking-button strong {
        font-size: 14.5px;
        font-weight: 800;
        line-height: 1.05;
        white-space: nowrap;
      }

      .cast-booking-button span {
        font-size: 10.5px;
        line-height: 1.15;
        opacity: .82;
        white-space: nowrap;
      }

      @media (min-width: 768px) {
        .cast-booking-cta.mobile {
          display: none !important;
        }
      }

      .cast-desktop {
        min-height: auto;
        background: var(--vy-bg);
        padding: 38px 28px 34px;
      }

      .cast-desktop-shell {
        max-width: 1240px;
        margin: 0 auto;
        color: var(--vy-text);
        background: #0e0d12;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 18px;
        box-shadow: 0 30px 70px -34px rgba(0,0,0,.7);
        padding: 26px;
        overflow: hidden;
      }

      .cast-desktop-grid {
        display: grid;
        grid-template-columns: minmax(340px, 40%) minmax(0, 1fr) 280px;
        gap: 28px;
        align-items: start;
      }

      .cast-desktop-main-media {
        position: relative;
        width: 100%;
        height: 640px;
        border: 0;
        border-radius: 18px;
        overflow: hidden;
        background-size: cover !important;
        background-position: center !important;
        padding: 0;
        cursor: pointer;
        box-shadow: inset 0 -120px 80px -70px rgba(0,0,0,.85);
      }

      .cast-desktop-main-media.is-placeholder {
        box-shadow: inset 0 -120px 80px -70px rgba(0,0,0,.85);
      }

      .cast-media-label {
        position: absolute;
        left: 14px;
        top: 14px;
        border-radius: 999px;
        background: rgba(17,17,20,.78);
        border: 1px solid rgba(212,178,106,.26);
        color: #f4e3b4;
        padding: 7px 12px;
        font-size: 12px;
        font-weight: 800;
      }

      .cast-play-desktop {
        position: absolute;
      }

      .cast-desktop-thumbs {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 8px;
        margin-top: 10px;
      }

      .cast-thumb {
        position: relative;
        width: 100%;
        height: 88px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 14px;
        background-size: cover !important;
        background-position: center !important;
        overflow: hidden;
        padding: 0;
        cursor: pointer;
      }

      .cast-thumb.is-active {
        border-color: var(--vy-gold);
        box-shadow: 0 0 0 2px rgba(212,178,106,.18);
      }

      .cast-desktop-content {
        min-width: 0;
      }

      .cast-store-sidebar {
        height: fit-content;
        position: sticky;
        top: 24px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 18px;
        background: var(--vy-surface-1);
        padding: 16px;
        color: var(--vy-text);
      }

      .cast-store-sidebar h2,
      .cast-store-sidebar strong,
      .cast-store-sidebar .cast-related-card strong {
        color: #fff;
      }

      .cast-store-sidebar p {
        color: var(--vy-muted);
        font-size: 13px;
        line-height: 1.55;
      }

      .cast-store-action {
        min-height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a);
        color: var(--vy-on-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        text-decoration: none;
        font-weight: 850;
        font-size: 13px;
      }

      .cast-store-sidebar .cast-related-list {
        display: grid;
        gap: 10px;
        margin-top: 12px;
      }

      .cast-store-sidebar .cast-related-card {
        display: grid;
        grid-template-columns: 58px 1fr;
        gap: 10px;
        border-radius: 12px;
        padding: 8px;
        background: var(--vy-surface-3);
      }

      .cast-store-sidebar .cast-related-media {
        width: 58px;
        height: 58px;
        border-radius: 10px;
      }

      .cast-store-sidebar .cast-related-card small,
      .cast-store-sidebar .cast-related-card span {
        color: var(--vy-muted);
        font-size: 11px;
      }

      .cast-badge-row.desktop {
        margin-bottom: 18px;
      }

      .cast-desktop-name-block h1 {
        margin: 0;
        color: #fff;
        font-size: clamp(38px, 4vw, 56px);
        line-height: .96;
        font-weight: 750;
      }

      .cast-desktop-name-block p {
        margin: 10px 0 0;
        color: var(--vy-muted);
        font-size: 14px;
      }

      .cast-desktop-stat-row {
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 16px;
      }

      .cast-desktop-stat-row span {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--vy-muted);
        font-size: 12px;
      }

      .cast-desktop-stat-row svg {
        color: #e3c27e;
      }

      .cast-desktop-stat-row b {
        color: var(--vy-text);
        font-size: 16px;
      }

      .cast-desktop-chips {
        margin-top: 18px;
      }

      .cast-desktop-copy {
        margin-top: 18px;
        font-size: 13.5px;
      }

      .cast-desktop-booking {
        margin-top: 24px;
      }

      .cast-desktop-booking-actions {
        gap: 12px;
        flex-wrap: wrap;
      }

      .cast-desktop-booking .cast-booking-button {
        flex: 0 0 auto;
        min-width: 210px;
        padding: 12px 40px;
      }

      .cast-desktop-booking p {
        display: flex;
        align-items: center;
        gap: 7px;
        margin: 13px 0 0;
        color: var(--vy-muted);
        font-size: 11.5px;
      }

      .cast-desktop-booking p svg {
        color: #7fb98e;
      }

      .cast-related-section.desktop {
        margin-top: 34px;
      }

      .cast-related-section.desktop .cast-section-heading h2 {
        font-size: 18px;
      }

      .cast-related-section.desktop .cast-related-list {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .cast-related-section.desktop .cast-related-card {
        background: var(--vy-surface-1);
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 16px;
        overflow: hidden;
      }

      .cast-related-section.desktop .cast-related-media {
        height: 200px;
        box-shadow: inset 0 -90px 70px -60px rgba(0,0,0,.75);
      }

      .cast-related-section.desktop .cast-related-copy {
        padding: 12px 13px 14px;
      }

      .cast-related-section.desktop .cast-related-copy strong {
        font-size: 15px;
      }

      html.vy-light .cast-desktop-shell {
        background: rgba(255,250,240,.78);
        border-color: rgba(212,178,106,.22);
        box-shadow: 0 30px 70px -42px rgba(80,61,27,.38);
      }

      html.vy-light .cast-desktop-name-block h1 {
        color: #241a0f;
        text-shadow: none;
      }

      html.vy-light .cast-desktop-name-block p,
      html.vy-light .cast-desktop-stat-row span,
      html.vy-light .cast-desktop-copy {
        color: #6f6657;
      }

      html.vy-light .cast-desktop-stat-row b,
      html.vy-light .cast-desktop .cast-info-row strong {
        color: #4a3924;
        font-weight: 750;
      }

      html.vy-light .cast-desktop .cast-info-row span {
        color: #857968;
      }

      html.vy-light .cast-desktop .cast-chip.language,
      html.vy-light .cast-desktop .cast-chip.tag {
        background: rgba(255,255,255,.74);
        color: #5f5548;
        border-color: rgba(212,178,106,.26);
      }

      html.vy-light .cast-related-section.desktop .cast-related-card {
        background: #fffaf0;
        border-color: rgba(212,178,106,.28);
        box-shadow: 0 14px 34px rgba(80,61,27,.08);
      }

      html.vy-light .cast-related-section.desktop .cast-related-copy strong {
        color: #3a3022;
      }

      html.vy-light .cast-related-section.desktop .cast-related-copy small,
      html.vy-light .cast-related-section.desktop .cast-related-copy em {
        color: #746a5a;
      }

      .nl-page-content:has(.cast-page) {
        padding-left: 0 !important;
        padding-right: 0 !important;
        background: var(--vy-bg) !important;
      }

      .nl-page-content:has(.cast-page) .cast-page {
        width: 100vw;
        margin-left: calc(50% - 50vw);
      }

      .cast-desktop {
        padding: 38px 28px 48px;
      }

      .cast-desktop-shell {
        width: min(1240px, calc(100vw - 56px));
        max-width: none;
        padding: 22px 30px 30px;
      }

      .cast-desktop-grid {
        grid-template-columns: 464px minmax(0, 1fr);
        gap: 34px;
      }

      .cast-desktop-content {
        min-width: 0;
      }

      .cast-desktop-breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--vy-muted);
        font-size: 12.5px;
        margin-bottom: 20px;
      }

      .cast-desktop-breadcrumb a {
        color: var(--vy-muted);
        text-decoration: none;
      }

      .cast-desktop-breadcrumb strong {
        color: var(--vy-muted);
        font-weight: 600;
      }

      .cast-desktop-main-media-wrap {
        position: relative;
      }

      .cast-desktop-main-media {
        height: 540px;
        display: block;
        box-shadow:
          inset 0 -145px 90px -76px rgba(0,0,0,.92),
          0 20px 44px -22px rgba(0,0,0,.7);
      }

      .cast-media-label,
      .cast-desktop .cast-badge-row.desktop {
        display: none;
      }

      .cast-desktop-media-rank {
        position: absolute;
        top: 14px;
        left: 14px;
        font-size: 11px;
        padding: 7px 13px 7px 10px;
      }

      .cast-desktop-media-live {
        position: absolute;
        left: 14px;
        bottom: 14px;
        background: rgba(12,12,15,.5);
      }

      .cast-desktop-main-media-wrap .cast-favorite-action {
        position: absolute;
        top: 14px;
        right: 14px;
        z-index: 4;
        width: 42px;
        height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 999px;
        background: rgba(17,17,20,.72);
        color: #f6ecda;
        box-shadow: 0 12px 28px -18px rgba(0,0,0,.9);
        backdrop-filter: blur(8px);
      }

      .cast-desktop-thumbs {
        gap: 8px;
        margin-top: 10px;
      }

      .cast-thumb {
        height: 74px;
        border-radius: 10px;
      }

      .cast-desktop-profile {
        padding-right: 0;
      }

      .cast-desktop-name-block {
        display: flex;
        align-items: flex-end;
        gap: 14px;
        flex-wrap: wrap;
      }

      .cast-desktop-name-block h1 {
        font-size: 34px;
        line-height: 1;
        letter-spacing: 0;
      }

      .cast-desktop-name-block p {
        margin: 0 0 4px;
        color: var(--vy-muted);
        font-size: 14px;
      }

      .cast-desktop-stat-row {
        gap: 22px;
        margin-top: 18px;
        padding: 14px 0;
        border-top: 1px solid var(--vy-border);
        border-bottom: 1px solid rgba(255,255,255,.07);
      }

      .cast-desktop-stat-row span {
        min-width: 0;
      }

      .cast-desktop-chips {
        margin-top: 18px;
      }

      .cast-desktop-copy {
        max-width: 100%;
        margin-top: 18px;
        color: var(--vy-muted);
      }

      .cast-detail-list.desktop {
        margin-top: 15px;
        gap: 11px;
      }

      .cast-section-heading.compact {
        margin-top: 24px;
        margin-bottom: 13px;
      }

      .cast-venue-card:not(.compact) {
        align-items: center;
        gap: 15px;
      }

      .cast-venue-card:not(.compact) .cast-venue-action {
        white-space: nowrap;
      }

      .cast-desktop-booking {
        margin-top: 24px;
      }

      .cast-desktop-booking .cast-booking-button {
        min-width: 190px;
        padding: 12px 40px;
      }

      .cast-related-section.desktop {
        margin-top: 34px;
      }

      .cast-related-section.desktop .cast-related-list {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .cast-lightbox {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: #000;
        color: var(--vy-text);
        display: grid;
        grid-template-rows: auto 1fr auto auto;
        gap: 16px;
        padding: 22px 20px 24px;
        touch-action: pan-y;
      }

      .cast-lightbox-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 2;
      }

      .cast-lightbox-topbar span {
        font-size: 13px;
        font-weight: 750;
        letter-spacing: .5px;
      }

      .cast-lightbox-topbar em {
        color: #6f6b62;
        font-style: normal;
      }

      .cast-lightbox-close,
      .cast-lightbox-nav {
        border: 1px solid rgba(255,255,255,.16);
        background: rgba(255,255,255,.08);
        color: var(--vy-text);
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .cast-lightbox-close {
        width: 38px;
        height: 38px;
      }

      .cast-lightbox-nav {
        position: fixed;
        top: 50%;
        width: 40px;
        height: 40px;
        transform: translateY(-50%);
        transition: none;
        animation: none;
        will-change: auto;
        backdrop-filter: blur(6px);
      }

      .cast-lightbox-nav:active,
      .cast-lightbox-nav:where(:hover, :focus-visible) {
        transform: translateY(-50%) !important;
      }

      .cast-lightbox-nav.previous {
        left: 14px;
      }

      .cast-lightbox-nav.next {
        right: 14px;
      }

      .cast-lightbox-media {
        min-height: 0;
        display: grid;
        place-items: center;
      }

      .cast-lightbox-placeholder {
        width: min(520px, 100%);
        aspect-ratio: 4 / 3;
        border-radius: 18px;
        border: 1px solid rgba(212,178,106,.24);
        background: linear-gradient(135deg,#19191d,#2a2418);
        color: #f0dda8;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .cast-lightbox-placeholder strong {
        font-size: 14px;
        font-weight: 900;
      }

      .cast-lightbox-media img,
      .cast-lightbox-media video,
      .cast-lightbox-media iframe {
        max-width: 100%;
        max-height: 100%;
        width: 100%;
        height: 100%;
        object-fit: contain;
        border: 0;
        background: #000;
      }

      .cast-lightbox-caption {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }

      .cast-lightbox-caption strong,
      .cast-lightbox-caption span {
        display: block;
      }

      .cast-lightbox-caption strong {
        color: var(--vy-text);
        font-size: 14px;
      }

      .cast-lightbox-caption span {
        color: #9b958a;
        font-size: 11px;
        margin-top: 2px;
      }

      .cast-lightbox-thumbs {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .cast-lightbox-thumbs::-webkit-scrollbar {
        display: none;
      }

      .cast-lightbox-thumb {
        position: relative;
        width: 54px;
        height: 54px;
        flex: 0 0 54px;
        border-radius: 10px;
        border: 0;
        opacity: .55;
        background-size: cover !important;
        background-position: center !important;
      }

      .cast-lightbox-thumb.is-placeholder {
        display: grid;
        place-items: center;
      }

      .cast-lightbox-thumb.is-active {
        opacity: 1;
        border: 2px solid #d4b26a;
      }

      .cast-lightbox-video-dot {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #fff;
        background: rgba(0,0,0,.3);
      }

      @media (max-width: 1180px) {
        .cast-desktop-grid {
          grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
          gap: 22px;
        }

        .cast-store-sidebar {
          grid-column: 1 / -1;
          position: static;
        }

        .cast-desktop-main-media {
          height: 560px;
        }

        .cast-schedule-grid.desktop {
          grid-template-columns: 1fr;
          gap: 8px;
        }
      }

      @media (max-width: 980px) {
        .cast-desktop-shell {
          width: min(760px, calc(100vw - 40px));
          padding: 20px;
        }

        .cast-desktop-grid {
          grid-template-columns: 1fr;
        }

        .cast-desktop-main-media {
          height: min(620px, 72vw);
        }
      }

      @media (min-width: 768px) {
        .cast-lightbox {
          background: rgba(4,4,7,.94);
          padding: 24px;
        }

        .cast-lightbox-media {
          width: auto;
          max-width: min(1040px, 82vw);
          height: auto;
          max-height: 68vh;
          justify-self: center;
          align-self: center;
          overflow: visible;
        }

        .cast-lightbox-media img,
        .cast-lightbox-media video {
          width: auto;
          height: auto;
          max-width: min(1040px, 82vw);
          max-height: 68vh;
          border-radius: 18px;
        }

        .cast-lightbox-media iframe {
          width: min(1040px, 82vw);
          height: min(68vh, 585px);
          border-radius: 18px;
        }

        .cast-lightbox-caption,
        .cast-lightbox-thumbs,
        .cast-lightbox-topbar {
          width: min(1040px, 82vw);
          justify-self: center;
        }
      }

      @media (max-width: 420px) {
        .cast-venue-card.compact {
          align-items: flex-start;
        }

        .cast-venue-card.compact .cast-venue-action {
          align-self: center;
        }

        .cast-schedule-row {
          align-items: flex-start;
          flex-direction: column;
          gap: 5px;
        }
      }

      @media (max-width: 370px) {
        .cast-mobile-hero {
          min-height: 420px;
        }

        .cast-title-row h1 {
          font-size: 29px;
        }

        .cast-gallery-tile {
          flex-basis: 86px;
          height: 64px;
        }
      }
    `}</style>
  );
}
