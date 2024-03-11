import { useEffect } from 'react';
import { useDB } from '@fallcrate/hooks/use-db';

type MergeAccountsEventDetail = {
  localUid: string;
  remoteUid: string;
};

export function useMergeAccounts() {
  useEffect(() => {
    const onMergeAccounts = async (localUid: string, remoteUid: string) => {
      const dbRemote = useDB(remoteUid);
      dbRemote.transferFiles(localUid, remoteUid);
    };

    const handleMergeAccounts = (
      mergeAccountsEvent: CustomEvent<MergeAccountsEventDetail>,
    ) => {
      const { localUid, remoteUid } = mergeAccountsEvent.detail;
      onMergeAccounts(localUid, remoteUid);
    };

    window.addEventListener(
      'mergeAccounts',
      handleMergeAccounts as EventListener,
    );

    return () =>
      window.removeEventListener(
        'mergeAccounts',
        handleMergeAccounts as EventListener,
      );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
