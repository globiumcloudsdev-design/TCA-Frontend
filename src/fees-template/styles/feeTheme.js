export const feeTheme = {
  light: {
    colors: {
      primary: '#0f4c81',
      secondary: '#145da0',
      border: '#cfd8e3',
      text: '#0f172a',
      mutedText: '#475569',
      paper: '#ffffff',
      headerBackground: '#eef4fb',
      tableHeader: '#f4f7fb',
    },
    fontSize: {
      title: '24px',
      subtitle: '12px',
      body: '11px',
      small: '10px',
      tiny: '9px',
    },
    table: {
      borderWidth: '0.7px',
      cellPadding: '6px',
      headerWeight: 700,
    },
    spacing: {
      pagePadding: '10mm',
      sectionGap: '8px',
      fieldGap: '4px',
    },
  },
  dark: {
    colors: {
      primary: '#c7d9ff',
      secondary: '#9fc1ff',
      border: '#334155',
      text: '#e2e8f0',
      mutedText: '#94a3b8',
      paper: '#0f172a',
      headerBackground: '#1e293b',
      tableHeader: '#0b1220',
    },
    fontSize: {
      title: '24px',
      subtitle: '12px',
      body: '11px',
      small: '10px',
      tiny: '9px',
    },
    table: {
      borderWidth: '0.7px',
      cellPadding: '6px',
      headerWeight: 700,
    },
    spacing: {
      pagePadding: '10mm',
      sectionGap: '8px',
      fieldGap: '4px',
    },
  },
};

export const getFeeTheme = (resolvedTheme = 'light') => {
  return resolvedTheme === 'dark' ? feeTheme.dark : feeTheme.light;
};
