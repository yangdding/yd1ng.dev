# 비밀번호 보호 기능 디버깅 가이드

## 1. 데이터베이스 확인
먼저 Supabase에서 다음 SQL을 실행하여 password 컬럼이 있는지 확인하세요:

```sql
-- Check if password column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'password';
```

만약 결과가 없다면, 다음을 실행하세요:

```sql
-- Add password column
ALTER TABLE posts ADD COLUMN password TEXT;
```

## 2. 브라우저 콘솔 확인
1. 브라우저에서 F12를 눌러 개발자 도구를 열기
2. Console 탭으로 이동
3. 새 포스트를 생성할 때 다음 로그들을 확인:
   - "PostEditor submit data:" - password 필드가 포함되어 있는지
   - "Creating post with data:" - API로 전송되는 데이터
   - "Password field:" - password 값이 올바른지

## 3. 포스트 목록에서 확인
포스트 목록에서 다음 로그들을 확인:
   - "BlogPost props:" - password 필드가 전달되는지
   - 포스트 클릭 시 "Post clicked:" - password 값이 있는지

## 4. 문제 해결 단계

### 문제 1: 데이터베이스에 password 컬럼이 없음
- `supabase-add-password-column.sql` 실행

### 문제 2: API에서 password 필드가 저장되지 않음
- 콘솔에서 "Creating post with data:" 로그 확인
- password 필드가 포함되어 있는지 확인

### 문제 3: BlogPost에서 password prop이 전달되지 않음
- 콘솔에서 "BlogPost props:" 로그 확인
- password 값이 undefined가 아닌지 확인

### 문제 4: 비밀번호 다이얼로그가 나타나지 않음
- 포스트 클릭 시 "Post clicked:" 로그 확인
- password 값이 있고 isAdmin이 false인지 확인

## 5. 테스트 방법
1. 관리자로 로그인
2. 새 포스트 생성
3. "Password Protected" 체크
4. 비밀번호 입력 (예: "test123")
5. 저장
6. 로그아웃
7. 포스트 클릭하여 비밀번호 다이얼로그 확인
8. 비밀번호 입력하여 접근 확인

## 6. 현재 구현된 기능
- ✅ PostEditor에서 비밀번호 설정
- ✅ API에서 password 필드 저장
- ✅ BlogPost에서 비밀번호 보호 표시
- ✅ 비밀번호 입력 다이얼로그
- ✅ 관리자 우회 기능
- ✅ Lock 아이콘 표시


