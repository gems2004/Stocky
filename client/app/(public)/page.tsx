import { GetSetupStatus } from "@/(api)/api";

export default async function Home() {
  console.log(await GetSetupStatus());

  return (
    <div>
      <h1></h1>
    </div>
  );
}
