# お問い合わせの接続

今回の送信APIは Resend を使います。メールソフトを開く方式は廃止しました。
Vercel の Environment Variables に以下を設定して再デプロイしてください。

- RESEND_API_KEY: Resend の送信用APIキー（公開変数にしない）
- CONTACT_FROM_EMAIL: Resend で認証したドメインの送信元
- CONTACT_TO_EMAIL: お問い合わせを受け取るメールアドレス

公式案内: https://resend.com/docs/send-with-nextjs
送信元ドメインの認証: https://resend.com/domains

未設定時は503と説明を返します。送信APIの成功が確認できた場合だけ完了画面を表示します。
本番のメール到着確認は未実施です。設定後はご自身のメールアドレスでテストしてください。
公開フォームの大量送信防止にはVercel Firewall等で /api/contact のレート制限も設定してください。

# 更新ファイル

ZIPの app フォルダをリポジトリの app に統合してください。
既存の app を削除せず、新しいファイルも追加してください。

# ニュース

/news/記事ID でCMSの公開記事を表示します。本文はプレーンテキストとして表示します。
本文未登録時、非公開記事、通信エラーにはそれぞれ案内を表示します。

# 会員画面

生成した画像はデザイン検討案です。既存の会員画面は今回変更していません。
