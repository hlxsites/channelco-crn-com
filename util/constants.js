const urlToNameMapping = {
    '/news/components-peripherals/': {
      name: 'Components & Peripherals',
      elements: [
        'CPUs/GPUs',
        'Digital Signage/Monitors',
        'Hard Drives',
        'Motherboards',
        'Printers',
        'White Box'
      ],
    },
    '/news/software/': {
      name: 'Software',
      elements: [
        'Application Development',
        'Business Intelligence and Analytics',
        'Collaboration & Communication',
        'Database and System Software',
        'Enterprise Applications',
        'Open Source',
        'Operating Systems',
        'SMB Applications',
        'Software as a Service'
      ],
    },
    '/news/channel-news/': {
      name: 'Channel News',
      elements: [
        'Distribution',
        'Mergers and Acquisitions',
        'Professional Services',
        'SMB-Midmarket Opportunities',
        'Vertical Opportunities',
        'Channel Programs'
      ],
    },
    '/news/security/': {
      name: 'Security',
      elements: [
        'Access Control',
        'Application and Platform Security',
        'Current Threats',
        'Data Breaches',
        'Data Protection Technologies',
        'Network Security',
        'Threat Management'
      ],
    },
    '/news/networking/': {
      name: 'Networking',
      elements: [
        'Routers and Switches',
        'Telecom',
        'VOIP and Unified Communications',
        'Video',
        'Wireless'
      ],
    },
    '/news/cloud/': {
      name: 'Cloud',
      elements: [
        'Cloud Channel Programs',
        'Cloud Infrastructure',
        'Cloud Platforms',
        'Cloud Security',
        'Cloud Software',
        'Cloud Storage',
        'Cloud VARs'
      ],
    },
    '/news/data-center/': {
      name: 'Data Center',
      elements: [
        'Network/Systems Management',
        'Power/Heating and Cooling',
        'Servers'
      ],
    }
    // ... you can add more URLs here
  };
  
  export function getElementsFromUrl(url) {
    const mapping = urlToNameMapping[url];
    if (!mapping) {
      return null;
    }
    return {
      name: mapping.name,
      elements: mapping.elements
    };
  }