export function CastProfileStyles() {
  return (
    <style>{`
      .cast-page {
        min-height: 100vh;
        color: var(--vy-text);
        font-family: var(--nl-font-sans);
        background: var(--vy-bg);
      }

      .cast-mobile {
        min-height: 100vh;
        padding-bottom: calc(24px + env(safe-area-inset-bottom));
        background: var(--vy-bg);
      }

      .nl-page-content:has(.cast-page) {
        padding-bottom: 0 !important;
        scroll-padding-bottom: calc(168px + env(safe-area-inset-bottom)) !important;
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

      .cast-icon-link,
      .cast-icon-button {
        width: 38px;
        height: 38px;
        min-width: 38px;
        min-height: 38px;
        border: 1px solid rgba(182,146,74,.48);
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(244,227,180,.98), rgba(212,178,106,.96) 58%, rgba(182,146,74,.95));
        color: var(--vy-on-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        text-decoration: none;
        padding: 0;
        box-shadow: 0 12px 26px rgba(79,57,19,.22);
      }

      .cast-icon-button {
        appearance: none;
        cursor: pointer;
      }

      .cast-icon-button.is-active {
        color: var(--vy-on-gold);
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
        border: 1px solid rgba(182,146,74,.48);
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(244,227,180,.98), rgba(212,178,106,.96) 58%, rgba(182,146,74,.95));
        color: var(--vy-on-gold);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        pointer-events: auto;
        transform: translateY(-50%);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 26px rgba(79,57,19,.24);
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
        width: 58px;
        height: 58px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a);
        color: var(--vy-on-gold);
        box-shadow: 0 16px 36px rgba(0,0,0,.34);
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

      .cast-chip.language {
        background: rgba(212,178,106,.12);
        color: #d9c08a;
        border: 1px solid rgba(212,178,106,.26);
      }

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

      .cast-related-copy small,
      .cast-related-copy em {
        color: var(--vy-muted);
        font-size: 10.5px;
        font-style: normal;
      }

      .cast-booking-cta.mobile {
        position: fixed;
        z-index: 70;
        left: 0;
        right: 0;
        bottom: calc(74px + env(safe-area-inset-bottom));
        display: flex;
        align-items: center;
        gap: 11px;
        min-height: 76px;
        margin: 0;
        padding: 12px 16px;
        background: rgba(255,250,240,.98);
        border-top: 1px solid rgba(212,178,106,.30);
        box-shadow: 0 -16px 34px rgba(80,61,27,.14);
        backdrop-filter: blur(12px);
        transform: translateZ(0);
        pointer-events: auto;
      }

      .cast-booking-favorite {
        width: 46px;
        height: 46px;
        flex: none;
        border-radius: 13px;
        border: 1px solid rgba(212,178,106,.45);
        background: #fffaf0;
        color: #d4a744;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 10px 20px rgba(80,61,27,.10);
      }

      .cast-booking-favorite.is-active {
        border-color: rgba(182,146,74,.55);
        background: linear-gradient(135deg,#f4e3b4,#d4b26a 58%,#b6924a);
        color: var(--vy-on-gold);
      }

      .cast-booking-button {
        flex: 1;
        min-height: 50px;
        border-radius: 13px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg,#f0dda8,#d4b26a 55%,#b6924a);
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

      .cast-desktop {
        min-height: 100vh;
        background: var(--vy-bg);
        padding: 38px 28px 48px;
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

      .cast-desktop-favorite-anchor {
        position: relative;
      }

      .cast-desktop-profile {
        padding-right: 58px;
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

      .cast-desktop-fav {
        position: absolute;
        top: 0;
        right: 0;
        width: 50px;
        height: 50px;
        border-radius: 13px;
        border: 1px solid var(--vy-border);
        background: var(--vy-surface-3);
        color: #e0729e;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
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
      .cast-desktop .cast-badge-row.desktop,
      .cast-desktop-fav {
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

      .cast-desktop-media-fav {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 38px;
        height: 38px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.2);
        background: rgba(12,12,15,.5);
        color: #fff;
        display: grid;
        place-items: center;
        padding: 0;
        cursor: pointer;
        backdrop-filter: blur(6px);
      }

      .cast-desktop-media-fav.is-active {
        color: #e0729e;
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
        letter-spacing: -.02em;
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
        z-index: 80;
        background: #000;
        color: var(--vy-text);
        display: grid;
        grid-template-rows: auto 1fr auto auto;
        gap: 16px;
        padding: 22px 20px 24px;
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
        backdrop-filter: blur(6px);
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
          width: min(1040px, 82vw);
          justify-self: center;
        }

        .cast-lightbox-media img,
        .cast-lightbox-media video,
        .cast-lightbox-media iframe {
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
