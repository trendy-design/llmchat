import Hotjar from '@hotjar/browser';

const siteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID;
const hotjarVersion = process.env.NEXT_PUBLIC_HOTJAR_VERSION;

const initHotjar = () => {
  if (siteId && hotjarVersion) {
    Hotjar.init(parseInt(siteId), parseInt(hotjarVersion));
  }
};

export { initHotjar };
